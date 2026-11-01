import {orbitalPosition,type Vec2} from './orbits';
import {planetaryVelocityAt} from './interplanetary-handoff';
import type {FlightState} from './spaceflight/types';
import type {Body,World} from './world';

export type EntityId=string;
export type FrameId='solar'|`body:${string}`;
export type EpochS=number;
export type StateVector=Readonly<{
 entityId:EntityId;frameId:FrameId;epochS:EpochS;
 positionM:Vec2;velocityMs:Vec2;massKg?:number;fuelKg?:number;
}>;

/** Non-rotating, translating frames. All vectors use SI and absolute simulation seconds. */
export const solarFrame:FrameId='solar';
export const bodyFrame=(id:EntityId):FrameId=>`body:${id}`;
const add=(a:Vec2,b:Vec2):Vec2=>({x:a.x+b.x,y:a.y+b.y});
const sub=(a:Vec2,b:Vec2):Vec2=>({x:a.x-b.x,y:a.y-b.y});
const finite=(v:Vec2):boolean=>Number.isFinite(v.x)&&Number.isFinite(v.y);

/** Resolve a frame origin and its inertial velocity using the existing ephemeris convention. */
export function frameOrigin(world:World,frameId:FrameId,epochS:EpochS):Readonly<{positionM:Vec2;velocityMs:Vec2}>{
 if(!Number.isFinite(epochS)||epochS<0)throw new Error('Invalid frame epoch');
 if(frameId===solarFrame)return {positionM:{x:0,y:0},velocityMs:{x:0,y:0}};
 if(!frameId.startsWith('body:'))throw new Error('Invalid frame identifier');
 const id=frameId.slice(5),body=world.bodies.find(b=>b.id===id);
 if(!body)throw new Error('Unknown frame body');
 if(body.kind==='star')return {positionM:{x:0,y:0},velocityMs:{x:0,y:0}};
 if(!body.orbit||!body.parentId)throw new Error('Invalid body ephemeris');
 const parent=frameOrigin(world,bodyFrame(body.parentId),epochS);
 const velocity=body.kind==='planet'?planetaryVelocityAt(body,epochS):orbitalVelocity(body,epochS);
 return {positionM:add(parent.positionM,orbitalPosition(body.orbit,epochS)),velocityMs:add(parent.velocityMs,velocity)};
}
function orbitalVelocity(body:Body,epochS:number):Vec2{
 const orbit=body.orbit!;
 const step=Math.min(1,orbit.period/1e6);
 const before=orbitalPosition(orbit,epochS-step),after=orbitalPosition(orbit,epochS+step);
 return {x:(after.x-before.x)/(2*step),y:(after.y-before.y)/(2*step)};
}
function validate(state:StateVector):void{
 if(!state.entityId||!Number.isFinite(state.epochS)||state.epochS<0||!finite(state.positionM)||!finite(state.velocityMs))throw new Error('Invalid state vector');
 if(state.massKg!==undefined&&(!Number.isFinite(state.massKg)||state.massKg<=0))throw new Error('Invalid state mass');
 if(state.fuelKg!==undefined&&(!Number.isFinite(state.fuelKg)||state.fuelKg<0||state.massKg===undefined||state.fuelKg>=state.massKg))throw new Error('Invalid state fuel');
}
/** Translate both position and velocity at the same epoch; never propagate or burn. */
export function transformState(world:World,state:StateVector,target:FrameId):StateVector{
 validate(state);
 // Identity transforms must preserve exact local precision; still verify the frame exists.
 if(state.frameId===target){frameOrigin(world,target,state.epochS);return state;}
 const from=frameOrigin(world,state.frameId,state.epochS),to=frameOrigin(world,target,state.epochS);
 return {...state,frameId:target,positionM:sub(add(state.positionM,from.positionM),to.positionM),
  velocityMs:sub(add(state.velocityMs,from.velocityMs),to.velocityMs)};
}
/** Adapt a legacy planet-local flight without changing its physical or resource state. */
export function fromLocalFlight(entityId:EntityId,planetId:EntityId,state:FlightState):StateVector{
 const vector:StateVector={entityId,frameId:bodyFrame(planetId),epochS:state.timeS,positionM:state.position,
  velocityMs:state.velocity,massKg:state.massKg,fuelKg:state.fuelKg};
 validate(vector);
 return vector;
}
/** Recover a legacy flight only when mass and propellant are available. */
export function toLocalFlight(state:StateVector):FlightState{
 validate(state);
 if(state.massKg===undefined||state.fuelKg===undefined)throw new Error('Missing flight resources');
 return {position:state.positionM,velocity:state.velocityMs,massKg:state.massKg,fuelKg:state.fuelKg,timeS:state.epochS};
}
/** Sample celestial truth in any frame without assigning spacecraft mass to a planet. */
export function celestialState(world:World,bodyId:EntityId,epochS:EpochS,target:FrameId=solarFrame):StateVector{
 const origin=frameOrigin(world,bodyFrame(bodyId),epochS);
 return transformState(world,{entityId:bodyId,frameId:solarFrame,epochS,positionM:origin.positionM,velocityMs:origin.velocityMs},target);
}
/** Adapt a heliocentric interplanetary probe checkpoint, retaining legacy resource values. */
export function fromHeliocentricProbe(entityId:EntityId,state:FlightState):StateVector{
 const vector:StateVector={entityId,frameId:solarFrame,epochS:state.timeS,positionM:state.position,
  velocityMs:state.velocity,massKg:state.massKg,fuelKg:state.fuelKg};
 validate(vector);
 return vector;
}

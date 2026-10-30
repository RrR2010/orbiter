import {orbitalPosition,type Vec2} from './orbits';
import {propagateCoast} from './spaceflight/coast';
import type {FlightState} from './spaceflight/types';
import type {World} from './world';
import type {TransferOpportunity} from './interplanetary-planner';

const SOLAR_MU=1.32712440018e20;
const add=(a:Vec2,b:Vec2):Vec2=>({x:a.x+b.x,y:a.y+b.y});
const subtract=(a:Vec2,b:Vec2):Vec2=>({x:a.x-b.x,y:a.y-b.y});
const length=(a:Vec2):number=>Math.hypot(a.x,a.y);
const velocityAt=(world:World,id:string,t:number):Vec2=>{
 const orbit=world.bodies.find(body=>body.id===id)?.orbit;
 if(!orbit)throw new Error('Missing planetary orbit');
 const dt=Math.min(10,orbit.period/100000);
 const a=orbitalPosition(orbit,t-dt),b=orbitalPosition(orbit,t+dt);
 return {x:(b.x-a.x)/(2*dt),y:(b.y-a.y)/(2*dt)};
};

export type InterplanetaryTrajectory=Readonly<{
 plan:TransferOpportunity;initial:FlightState;departureBurnMs:Vec2;
}>;
export type InterplanetaryEncounter=Readonly<{
 closestTimeS:number;closestDistanceM:number;relativeSpeedMs:number;
 arrivalDistanceM:number;withinTargetRadius:boolean;
}>;

/** Construct a heliocentric two-body transfer impulse, not a launch/escape model.
 * The departure impulse is tangential in the local prograde direction and derived
 * from the planned circular transfer. Planetary escape remains a separate gate.
 */
export function createInterplanetaryTrajectory(world:World,plan:TransferOpportunity):InterplanetaryTrajectory{
 const origin=world.bodies.find(body=>body.id===plan.originId);
 const target=world.bodies.find(body=>body.id===plan.targetId);
 if(!origin?.orbit||origin.kind!=='planet'||!target?.orbit||target.kind!=='planet'||!(plan.arrivalS>plan.departureS))throw new Error('Invalid trajectory plan');
 const position=orbitalPosition(origin.orbit,plan.departureS);
 const planetaryVelocity=velocityAt(world,origin.id,plan.departureS);
 const radialDistance=length(position),tangent={x:-position.y/radialDistance,y:position.x/radialDistance};
 const outward=target.orbit.semiMajorAxis>origin.orbit.semiMajorAxis;
 const desiredSpeed=Math.sqrt(SOLAR_MU*(2/radialDistance-2/(radialDistance+target.orbit.semiMajorAxis)));
 const circularSpeed=Math.sqrt(SOLAR_MU/radialDistance);
 const burn=desiredSpeed-circularSpeed;
 const departureBurnMs={x:tangent.x*burn,y:tangent.y*burn};
 const velocity=add(planetaryVelocity,departureBurnMs);
 return {plan,departureBurnMs,initial:{position,velocity,timeS:plan.departureS,massKg:1,fuelKg:0}};
}

/** Propagate the probe using solar gravity at an absolute simulation epoch. */
export function interplanetaryStateAt(trajectory:InterplanetaryTrajectory,timeS:number):FlightState{
 if(!Number.isFinite(timeS)||timeS<trajectory.initial.timeS)throw new Error('Invalid probe epoch');
 return propagateCoast(trajectory.initial,SOLAR_MU,timeS-trajectory.initial.timeS);
}

/** Sample physical probe-target separation; refine the closest sampled interval.
 * This bounded check cannot prove absence of brief encounters between samples.
 */
export function evaluateInterplanetaryEncounter(world:World,trajectory:InterplanetaryTrajectory,samples=256):InterplanetaryEncounter{
 if(!Number.isSafeInteger(samples)||samples<16||samples>8192)throw new Error('Invalid encounter resolution');
 const target=world.bodies.find(body=>body.id===trajectory.plan.targetId);
 if(!target?.orbit||target.kind!=='planet')throw new Error('Missing target');
 const {departureS,arrivalS}=trajectory.plan;
 const distanceAt=(timeS:number):number=>length(subtract(interplanetaryStateAt(trajectory,timeS).position,orbitalPosition(target.orbit!,timeS)));
 let bestTime=departureS,bestDistance=Infinity,bestIndex=0;
 for(let i=0;i<=samples;i++){
  const time=departureS+(arrivalS-departureS)*i/samples;
  const distance=distanceAt(time);
  if(distance<bestDistance){bestDistance=distance;bestTime=time;bestIndex=i;}
 }
 let left=departureS+(arrivalS-departureS)*Math.max(0,bestIndex-1)/samples;
 let right=departureS+(arrivalS-departureS)*Math.min(samples,bestIndex+1)/samples;
 for(let i=0;i<42;i++){
  const a=left+(right-left)/3,b=right-(right-left)/3;
  if(distanceAt(a)<distanceAt(b))right=b;else left=a;
 }
 const candidate=(left+right)/2;
 if(distanceAt(candidate)<bestDistance){bestTime=candidate;bestDistance=distanceAt(candidate);}
 const speed=subtract(interplanetaryStateAt(trajectory,bestTime).velocity,velocityAt(world,target.id,bestTime));
 return {closestTimeS:bestTime,closestDistanceM:bestDistance,relativeSpeedMs:length(speed),arrivalDistanceM:distanceAt(arrivalS),withinTargetRadius:bestDistance<=target.radius};
}

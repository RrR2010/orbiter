import type {World} from './world';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import type {TransferOpportunity} from './interplanetary-planner';
import {planEscapeInjection,type EscapeInjection} from './interplanetary-injection';
import {propagatePlanetaryEscape,type EscapeResult} from './interplanetary-escape';
import {propagateCoast} from './spaceflight/coast';
import type {FlightState} from './spaceflight/types';
import {orbitalPosition} from './orbits';

const SOLAR_MU=1.32712440018e20;
export type ContinuousTransfer=Readonly<{injection:EscapeInjection;escape:EscapeResult;arrival:FlightState;closestDistanceM:number;closestTimeS:number;closestRelativeSpeedMs:number;closestAltitudeM:number;arrivalDistanceM:number}>;

/** Bridge ideal parking-orbit injection to a continuous, unpowered heliocentric coast.
 * Departure and escape states keep physical mass, fuel and absolute time. The
 * closest-distance check reports geometry only, never declares scientific success.
 */
export function simulateContinuousTransfer(world:World,plan:TransferOpportunity,vehicle:VehicleCapability,aimOffsetRad=0):ContinuousTransfer|null{
 const home=world.bodies.find(body=>body.id===plan.originId);
 const target=world.bodies.find(body=>body.id===plan.targetId);
 if(!home||!target||target.kind!=='planet'||!target.orbit)return null;
 const injection=planEscapeInjection(home,target,plan,vehicle,plan.departureS,aimOffsetRad);
 if(!injection)return null;
 const escape=propagatePlanetaryEscape(world,home.id,injection.state);
 if(!escape||escape.heliocentric.timeS>=plan.arrivalS)return null;
 const gravity={radiusM:1,muM3S2:SOLAR_MU};
 const stateAt=(timeS:number):FlightState=>propagateCoast(escape.heliocentric,gravity,timeS-escape.heliocentric.timeS);
 const distanceAt=(timeS:number):number=>{
  const state=stateAt(timeS),position=orbitalPosition(target.orbit!,timeS);
  return Math.hypot(state.position.x-position.x,state.position.y-position.y);
 };
 const count=128;
 let closestDistanceM=Infinity,closestTimeS=escape.heliocentric.timeS;
 const start=escape.heliocentric.timeS,span=plan.arrivalS-start;
 let bestIndex=0;
 for(let i=0;i<=count;i++){
  const time=start+span*i/count,distance=distanceAt(time);
  if(distance<closestDistanceM){closestDistanceM=distance;closestTimeS=time;bestIndex=i;}
 }
 // Refine the closest sampled neighborhood without changing the actual probe orbit.
 let lo=start+span*Math.max(0,bestIndex-1)/count;
 let hi=start+span*Math.min(count,bestIndex+1)/count;
 for(let i=0;i<48;i++){
  const third=(hi-lo)/3,a=lo+third,b=hi-third;
  if(distanceAt(a)<=distanceAt(b))hi=b;else lo=a;
 }
 const refinedTime=(lo+hi)/2,refinedDistance=distanceAt(refinedTime);
 if(refinedDistance<closestDistanceM){closestDistanceM=refinedDistance;closestTimeS=refinedTime;}
 const arrival=stateAt(plan.arrivalS);
 const probe=stateAt(closestTimeS);
 // Derive the target's inertial velocity from the same ephemeris used for position.
 const dt=Math.min(10,target.orbit.period/1e6);
 const before=orbitalPosition(target.orbit,closestTimeS-dt);
 const after=orbitalPosition(target.orbit,closestTimeS+dt);
 const relativeX=probe.velocity.x-(after.x-before.x)/(2*dt);
 const relativeY=probe.velocity.y-(after.y-before.y)/(2*dt);
 return {injection,escape,arrival,closestDistanceM,closestTimeS,
  closestRelativeSpeedMs:Math.hypot(relativeX,relativeY),
  closestAltitudeM:closestDistanceM-target.radius,
  arrivalDistanceM:distanceAt(plan.arrivalS)};
}

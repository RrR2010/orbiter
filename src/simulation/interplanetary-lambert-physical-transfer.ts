import {orbitalPosition} from './orbits';
import type {World} from './world';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import type {FlightState} from './spaceflight/types';
import {propagateCoast} from './spaceflight/coast';
import {planVectorEscape,type VectorEscape} from './interplanetary-vector-escape';

const SOLAR_MU=1.32712440018e20;

/** An uncorrected Lambert-targeted mission propagated from its actual SOI state.
 * This measures the injection mismatch; it never assumes the ideal Lambert
 * departure velocity materializes at the actual handoff position or epoch.
 */
export type LambertPhysicalTransfer=Readonly<{
 escape:VectorEscape;arrival:FlightState;arrivalMissM:number;
 closestDistanceM:number;closestTimeS:number;closestAltitudeM:number;
}>;

export function simulateLambertPhysicalTransfer(
 world:World,originId:string,targetId:string,departureS:number,arrivalS:number,
 vehicle:VehicleCapability,
):LambertPhysicalTransfer|null{
 const target=world.bodies.find(body=>body.id===targetId);
 if(!target||target.kind!=='planet'||!target.orbit)return null;
 const escape=planVectorEscape(world,originId,targetId,departureS,arrivalS,vehicle);
 if(!escape||escape.escape.heliocentric.timeS>=arrivalS)return null;
 const start=escape.escape.heliocentric;
 const gravity={radiusM:1,muM3S2:SOLAR_MU};
 const stateAt=(timeS:number):FlightState=>propagateCoast(start,gravity,timeS-start.timeS);
 const distanceAt=(timeS:number):number=>{
  const probe=stateAt(timeS).position,planet=orbitalPosition(target.orbit!,timeS);
  return Math.hypot(probe.x-planet.x,probe.y-planet.y);
 };
 const samples=128,span=arrivalS-start.timeS;
 let bestIndex=0,closestDistanceM=Infinity;
 for(let i=0;i<=samples;i++){
  const distance=distanceAt(start.timeS+span*i/samples);
  if(distance<closestDistanceM){closestDistanceM=distance;bestIndex=i;}
 }
 let lo=start.timeS+span*Math.max(0,bestIndex-1)/samples;
 let hi=start.timeS+span*Math.min(samples,bestIndex+1)/samples;
 for(let i=0;i<40;i++){
  const one=lo+(hi-lo)/3,two=hi-(hi-lo)/3;
  if(distanceAt(one)<=distanceAt(two))hi=two;else lo=one;
 }
 const localTime=(lo+hi)/2,localDistance=distanceAt(localTime);
 const sampleTime=start.timeS+span*bestIndex/samples;
 const closestTimeS=localDistance<closestDistanceM?localTime:sampleTime;
 closestDistanceM=Math.min(localDistance,closestDistanceM);
 const arrival=stateAt(arrivalS);
 return {escape,arrival,arrivalMissM:distanceAt(arrivalS),
  closestDistanceM,closestTimeS,closestAltitudeM:closestDistanceM-target.radius};
}

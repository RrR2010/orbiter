import {orbitalPosition,type Orbit} from './orbits';
import {propagateCoast} from './spaceflight/coast';
import type {FlightState} from './spaceflight/types';

const SOLAR_MU=1.32712440018e20;
export type ClosestApproach=Readonly<{timeS:number;distanceM:number;altitudeM:number}>;

/** Find the closest heliocentric approach over a finite interval.
 * Dense deterministic sampling brackets local minima, then golden-section
 * refinement resolves the near-planet interval without moving the probe.
 */
export function measureClosestApproach(
 state:FlightState,targetOrbit:Orbit,targetRadiusM:number,endS:number,samples=128,
):ClosestApproach{
 if(!(targetRadiusM>0)||!Number.isFinite(targetRadiusM)||!Number.isFinite(endS)||
  endS<=state.timeS||!Number.isSafeInteger(samples)||samples<8||samples>4096)
  throw new Error('Invalid approach interval');
 const gravity={radiusM:1,muM3S2:SOLAR_MU},duration=endS-state.timeS;
 const distanceAt=(timeS:number):number=>{
  const probe=propagateCoast(state,gravity,timeS-state.timeS).position;
  const target=orbitalPosition(targetOrbit,timeS);
  return Math.hypot(probe.x-target.x,probe.y-target.y);
 };
 let bestTime=state.timeS,bestDistance=Infinity;
 const distances:number[]=[];
 for(let i=0;i<=samples;i++){
  const timeS=state.timeS+duration*i/samples,distance=distanceAt(timeS);
  distances.push(distance);
  if(distance<bestDistance){bestDistance=distance;bestTime=timeS;}
 }
 for(let i=1;i<samples;i++){
  if(distances[i]>distances[i-1]||distances[i]>distances[i+1])continue;
  let lo=state.timeS+duration*(i-1)/samples;
  let hi=state.timeS+duration*(i+1)/samples;
  for(let j=0;j<56;j++){
   const left=lo+(hi-lo)*.3819660112501051;
   const right=hi-(hi-lo)*.3819660112501051;
   if(distanceAt(left)<=distanceAt(right))hi=right;else lo=left;
  }
  const timeS=(lo+hi)/2,distance=distanceAt(timeS);
  if(distance<bestDistance){bestDistance=distance;bestTime=timeS;}
 }
 return {timeS:bestTime,distanceM:bestDistance,altitudeM:bestDistance-targetRadiusM};
}

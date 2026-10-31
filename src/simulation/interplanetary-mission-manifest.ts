import type {World} from './world';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import {correctLambertMidcourse} from './interplanetary-midcourse-correction';
import {measureClosestApproach} from './interplanetary-closest-approach';

export type InterplanetaryMissionMilestone=Readonly<{
 kind:'departure'|'course-correction'|'closest-approach'|'arrival';
 timeS:number;detail:string;
}>;
export type InterplanetaryMissionManifest=Readonly<{
 originId:string;targetId:string;departureS:number;arrivalS:number;
 outcome:'flyby'|'impact-risk'|'distant-miss';closestDistanceM:number;
 closestAltitudeM:number;courseCorrectionDeltaVMs:number;
 courseCorrectionFuelKg:number;remainingFuelKg:number;
 milestones:readonly InterplanetaryMissionMilestone[];
}>;

/** Precompute one physically executed probe mission into replayable milestones.
 * The strategic scheduler may later process these events without recomputing
 * the full solar trajectory on every render tick. This does not launch it.
 */
export function prepareInterplanetaryMission(
 world:World,originId:string,targetId:string,departureS:number,arrivalS:number,
 vehicle:VehicleCapability,aimOffsetRadii=3,
):InterplanetaryMissionManifest|null{
 const target=world.bodies.find(body=>body.id===targetId);
 if(!target||target.kind!=='planet'||!target.orbit)return null;
 const corrected=correctLambertMidcourse(
  world,originId,targetId,departureS,arrivalS,vehicle,.5,aimOffsetRadii);
 if(!corrected)return null;
 const approach=measureClosestApproach(corrected.checkpointAfter,target.orbit,target.radius,arrivalS);
 const outcome=approach.altitudeM<=0?'impact-risk':
  approach.distanceM<=10*target.radius?'flyby':'distant-miss';
 const milestones:InterplanetaryMissionMilestone[]=[
  {kind:'departure',timeS:departureS,detail:'Interplanetary departure executed'},
  {kind:'course-correction',timeS:corrected.checkpointAfter.timeS,
   detail:'Midcourse impulse executed'},
  {kind:'closest-approach',timeS:approach.timeS,detail:outcome},
  {kind:'arrival',timeS:arrivalS,detail:'Transfer assessment completed'},
 ];
 milestones.sort((a,b)=>a.timeS-b.timeS);
 return {originId,targetId,departureS,arrivalS,outcome,
  closestDistanceM:approach.distanceM,closestAltitudeM:approach.altitudeM,
  courseCorrectionDeltaVMs:corrected.deltaVMs,
  courseCorrectionFuelKg:corrected.fuelSpentKg,
  remainingFuelKg:corrected.arrival.fuelKg,milestones};
}

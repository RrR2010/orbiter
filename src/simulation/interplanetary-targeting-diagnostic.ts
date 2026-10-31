import type {World} from './world';
import type {TransferOpportunity} from './interplanetary-planner';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import {searchInterplanetaryDeparture,type DepartureSolution} from './interplanetary-departure-search';
import {assessPlanetaryApproach,type ApproachOutcome} from './interplanetary-approach';

export type TargetingDiagnostic=Readonly<{
 solution:DepartureSolution|null;outcome:ApproachOutcome|'no-escape';
 closestAltitudeM:number|null;closestDistanceM:number|null;
 distanceInTargetRadii:number|null;attempted:number;successful:number;
}>;

/** Diagnose a physically propagated targeting search without claiming success.
 * Returning no-escape is distinct from a distant heliocentric miss.
 */
export function diagnoseInterplanetaryTargeting(
 world:World,plan:TransferOpportunity,vehicle:VehicleCapability,
 windowS:number,epochSteps=4,angleSteps=4,
):TargetingDiagnostic{
 const target=world.bodies.find(body=>body.id===plan.targetId);
 if(!target||target.kind!=='planet')throw new Error('Invalid diagnostic target');
 const solution=searchInterplanetaryDeparture(world,plan,vehicle,windowS,epochSteps,angleSteps);
 const attempted=(epochSteps+1)*(angleSteps+1);
 if(!solution)return {solution:null,outcome:'no-escape',closestAltitudeM:null,
  closestDistanceM:null,distanceInTargetRadii:null,attempted,successful:0};
 const assessment=assessPlanetaryApproach(solution.transfer,target);
 return {solution,outcome:assessment.outcome,closestAltitudeM:assessment.closestAltitudeM,
  closestDistanceM:assessment.closestDistanceM,
  distanceInTargetRadii:assessment.closestDistanceM/target.radius,
  attempted:solution.attempted,successful:solution.successful};
}

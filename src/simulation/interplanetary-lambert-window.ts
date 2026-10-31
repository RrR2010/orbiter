import type {World} from './world';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import {planLambertDeparture,type LambertDeparture} from './interplanetary-lambert-departure';
import type {TransferOpportunity} from './interplanetary-planner';

export type LambertWindowCandidate=Readonly<{
 departureS:number;arrivalS:number;offsetS:number;plan:LambertDeparture;
}>;

/** Avoid the antipodal Lambert singularity of a perfectly phased Hohmann window.
 * Moving the launch epoch also moves the arrival epoch, preserving flight time.
 * Only actual solutions and available propellant are considered feasible.
 */
export function findLambertLaunchWindow(
 world:World,opportunity:TransferOpportunity,vehicle:VehicleCapability,
):LambertWindowCandidate|null{
 const offsets=[0,3600,-3600,21600,-21600,86400,-86400,259200,-259200];
 let best:LambertWindowCandidate|null=null;
 for(const offsetS of offsets){
  const departureS=opportunity.departureS+offsetS;
  if(departureS<0)continue;
  const arrivalS=departureS+opportunity.transferTimeS;
  const plan=planLambertDeparture(
   world,opportunity.originId,opportunity.targetId,departureS,arrivalS,vehicle);
  if(!plan||!plan.feasible)continue;
  if(!best||plan.burnDeltaVMs<best.plan.burnDeltaVMs)
   best={departureS,arrivalS,offsetS,plan};
 }
 return best;
}

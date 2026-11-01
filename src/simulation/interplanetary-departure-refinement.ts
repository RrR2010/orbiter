import type {World} from './world';
import type {TransferOpportunity} from './interplanetary-planner';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import {searchInterplanetaryDeparture,type DepartureSolution} from './interplanetary-departure-search';
import {simulateContinuousTransfer} from './interplanetary-continuous-transfer';

export type RefinedDeparture=Readonly<{solution:DepartureSolution;attempted:number;viable:number}>;

/** Refine both launch epoch and escape heading around the best physical candidate.
 * Every new candidate is fully propagated; the coarse winner remains eligible.
 * The bounded neighborhood shrinks each round and never fabricates a flyby.
 */
export function refineInterplanetaryDeparture(
 world:World,base:TransferOpportunity,vehicle:VehicleCapability,
 windowS:number,rounds=4,
):RefinedDeparture|null{
 if(!Number.isFinite(windowS)||windowS<=0||!Number.isSafeInteger(rounds)||rounds<1||rounds>8)
  throw new Error('Invalid departure refinement');
 const coarse=searchInterplanetaryDeparture(world,base,vehicle,windowS,4,4);
 if(!coarse)return null;
 let best=coarse,attempted=coarse.attempted,viable=coarse.successful;
 let timeStep=windowS/2,angleStep=Math.PI/8;
 for(let round=0;round<rounds;round++){
  const center=best;
  for(const dt of [-1,0,1]){
   for(const da of [-1,0,1]){
    if(dt===0&&da===0)continue;
    const departureS=center.plan.departureS+dt*timeStep;
    const angleRad=center.angleRad+da*angleStep;
    if(departureS<0||Math.abs(angleRad)>Math.PI/2)continue;
    const plan={...base,departureS,arrivalS:departureS+base.transferTimeS};
    attempted++;
    try{
     const transfer=simulateContinuousTransfer(world,plan,vehicle,angleRad);
     if(!transfer)continue;
     viable++;
     if(transfer.closestDistanceM<best.transfer.closestDistanceM)
      best={plan,angleRad,transfer,attempted,successful:viable};
    }catch(error){
     if(!(error instanceof Error)||!error.message.includes('Coast solver'))throw error;
    }
   }
  }
  timeStep/=2;angleStep/=2;
 }
 return {solution:{...best,attempted,successful:viable},attempted,viable};
}

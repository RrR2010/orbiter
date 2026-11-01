import type {World} from './world';
import type {TransferOpportunity} from './interplanetary-planner';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import {simulateContinuousTransfer,type ContinuousTransfer} from './interplanetary-continuous-transfer';

export type DepartureSolution=Readonly<{
 plan:TransferOpportunity;angleRad:number;transfer:ContinuousTransfer;
 attempted:number;successful:number;
}>;

/** Evaluate a finite grid of real departure epochs and injection headings.
 * The same flight duration is retained, so each candidate is a physical
 * departure/arrival pair rather than a fabricated encounter at the target.
 * Never move departure earlier than zero, and never award scientific success.
 */
export function searchInterplanetaryDeparture(
 world:World,base:TransferOpportunity,vehicle:VehicleCapability,
 windowS:number,epochSteps=4,angleSteps=4,
):DepartureSolution|null{
 if(!Number.isFinite(windowS)||windowS<0||
  !Number.isSafeInteger(epochSteps)||epochSteps<1||epochSteps>16||
  !Number.isSafeInteger(angleSteps)||angleSteps<2||angleSteps>16)
  throw new Error('Invalid departure search budget');
 let best:DepartureSolution|null=null,successful=0;
 const attempted=(epochSteps+1)*(angleSteps+1);
 for(let epoch=0;epoch<=epochSteps;epoch++){
  const departureS=base.departureS-windowS+2*windowS*epoch/epochSteps;
  if(departureS<0)continue;
  const plan={...base,departureS,arrivalS:departureS+base.transferTimeS};
  for(let heading=0;heading<=angleSteps;heading++){
   const angleRad=-Math.PI/2+Math.PI*heading/angleSteps;
   let transfer:ContinuousTransfer|null;
   try{transfer=simulateContinuousTransfer(world,plan,vehicle,angleRad);}
   catch(error){
    if(!(error instanceof Error)||!error.message.includes('Coast solver'))throw error;
    continue;
   }
   if(!transfer)continue;
   successful++;
   if(!best||transfer.closestDistanceM<best.transfer.closestDistanceM)
    best={plan,angleRad,transfer,attempted,successful};
  }
 }
 return best?{...best,attempted,successful}:null;
}

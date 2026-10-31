import type {World} from './world';
import type {TransferOpportunity} from './interplanetary-planner';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import {simulateContinuousTransfer,type ContinuousTransfer} from './interplanetary-continuous-transfer';

export type AimSolution=Readonly<{angleRad:number;transfer:ContinuousTransfer;attempts:number}>;

/** Search physically propagated transfers at bounded heading offsets.
 * Scores actual closest approach, not the planned Hohmann arrival distance.
 * This coarse sweep is deterministic and makes no promise of interception.
 */
export function searchInterplanetaryAim(
 world:World,plan:TransferOpportunity,vehicle:VehicleCapability,steps=16,
):AimSolution|null{
 if(!Number.isSafeInteger(steps)||steps<2||steps>64)throw new Error('Invalid aiming resolution');
 let best:AimSolution|null=null;
 for(let i=0;i<=steps;i++){
  const angleRad=-Math.PI/2+i*Math.PI/steps;
  let transfer:ContinuousTransfer|null;
  try{transfer=simulateContinuousTransfer(world,plan,vehicle,angleRad);}
  catch(error){
   // The underlying coast solver can reject extreme trajectories; only these
   // numerical failures make this candidate unavailable.
   if(!(error instanceof Error)||!error.message.includes('Coast solver'))throw error;
   continue;
  }
  if(!transfer)continue;
  if(!best||transfer.closestDistanceM<best.transfer.closestDistanceM)
   best={angleRad,transfer,attempts:steps+1};
 }
 return best;
}

/** Refine the best coarse heading with a bounded local grid.
 * Coarse candidates remain eligible, so refinement cannot worsen the measured
 * closest approach. Numerical failures only invalidate the candidate being tried.
 */
export function refineInterplanetaryAim(
 world:World,plan:TransferOpportunity,vehicle:VehicleCapability,steps=16,refinements=8,
):AimSolution|null{
 if(!Number.isSafeInteger(refinements)||refinements<1||refinements>32)
  throw new Error('Invalid aim refinement budget');
 const coarse=searchInterplanetaryAim(world,plan,vehicle,steps);
 if(!coarse)return null;
 let best=coarse;
 const width=Math.PI/steps;
 for(let i=1;i<=refinements;i++){
  const angleRad=Math.max(-Math.PI/2,Math.min(Math.PI/2,
   coarse.angleRad-width+2*width*i/(refinements+1)));
  let transfer:ContinuousTransfer|null;
  try{transfer=simulateContinuousTransfer(world,plan,vehicle,angleRad);}
  catch(error){
   if(!(error instanceof Error)||!error.message.includes('Coast solver'))throw error;
   continue;
  }
  if(transfer&&transfer.closestDistanceM<best.transfer.closestDistanceM)
   best={angleRad,transfer,attempts:steps+1+refinements};
 }
 return {...best,attempts:steps+1+refinements};
}

import type {Civilization} from './civilization';
import {rankTransferOpportunities,type TransferOpportunity} from './interplanetary-planner';
import {estimateTransferBudget,type TransferBudget} from './interplanetary-budget';
import {designVehicle} from './spaceflight/vehicle-capability';
import {gravityForRadius} from './spaceflight/gravity';
import type {World} from './world';

export type TransferCandidate=Readonly<{opportunity:TransferOpportunity;budget:TransferBudget;gravityUncertainty:number;score:number}>;

/** Rank physically budgeted proposals without mutating strategy or authorizing launch.
 * The technology gate and available resources remain the scheduler's responsibility.
 */
export function selectInterplanetaryOpportunity(civilization:Readonly<Civilization>,world:World,nowS:number):TransferCandidate|null{
 if(!Number.isFinite(nowS)||nowS<0)throw new Error('Invalid selection epoch');
 const home=world.bodies.find(body=>body.id===civilization.homeId);
 if(!home||home.kind!=='planet'||civilization.stage<4||!civilization.science)return null;
 const vehicle=designVehicle(gravityForRadius(home.radius),civilization.stage,civilization.knowledge,.5);
 const candidates:TransferCandidate[]=[];
 for(const opportunity of rankTransferOpportunities(world,home.id,nowS)){
  const target=world.bodies.find(body=>body.id===opportunity.targetId);
  if(!target)continue;
  const estimate=civilization.science.knowledge[target.id]?.gravity;
  if(!estimate)continue;
  const budget=estimateTransferBudget(home,target,opportunity,vehicle);
  if(!budget.feasible)continue;
  const gravityUncertainty=estimate.uncertainty/estimate.value;
  const waitDays=(opportunity.departureS-nowS)/86400;
  const score=opportunity.phaseErrorRad*1e5+budget.requiredDeltaVMs+
   waitDays*.2+gravityUncertainty*1000;
  candidates.push({opportunity,budget,gravityUncertainty,score});
 }
 candidates.sort((a,b)=>a.score-b.score||a.opportunity.targetId.localeCompare(b.opportunity.targetId));
 return candidates[0]??null;
}

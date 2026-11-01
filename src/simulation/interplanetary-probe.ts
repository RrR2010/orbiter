import type {World} from './world';
import type {TransferOpportunity} from './interplanetary-planner';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import {simulateContinuousTransfer,type ContinuousTransfer} from './interplanetary-continuous-transfer';
import {assessPlanetaryApproach,type ApproachAssessment} from './interplanetary-approach';
import {scienceFromPhysicalFlyby} from './interplanetary-observation';
import {enqueueScience,type PendingScience,type ScienceInbox} from './interplanetary-science-inbox';

export type ProbeEvaluation=Readonly<{
 transfer:ContinuousTransfer;assessment:ApproachAssessment;
 observation:PendingScience|null;
}>;

/** Evaluate a probe's real geometry before proposing any scientific message.
 * Planning a launch never constitutes a successful flyby or received knowledge.
 */
export function evaluateProbeMission(
 world:World,plan:TransferOpportunity,vehicle:VehicleCapability,missionId:string,
):ProbeEvaluation|null{
 const transfer=simulateContinuousTransfer(world,plan,vehicle);
 const target=world.bodies.find(body=>body.id===plan.targetId);
 if(!transfer||!target)return null;
 const assessment=assessPlanetaryApproach(transfer,target);
 const observation=scienceFromPhysicalFlyby(world,plan.originId,plan.targetId,missionId,transfer);
 return {transfer,assessment,observation};
}

/** Enqueue only the observation earned by a positive-altitude flyby.
 * The recipient must still process the future reception in its event scheduler.
 */
export function queueProbeScience(inbox:ScienceInbox,evaluation:ProbeEvaluation):ScienceInbox{
 return evaluation.observation?enqueueScience(inbox,evaluation.observation):inbox;
}

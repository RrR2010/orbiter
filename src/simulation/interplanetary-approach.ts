import type {ContinuousTransfer} from './interplanetary-continuous-transfer';
import type {Body} from './world';

export type ApproachOutcome='flyby'|'impact-risk'|'distant-miss';
export type ApproachAssessment=Readonly<{
 outcome:ApproachOutcome;closestAltitudeM:number;closestDistanceM:number;
 encounterThresholdM:number;relativeSpeedMs:number;
}>;

/** Classify only actual propagated geometry, not a planned arrival or a narrative result.
 * The scientific observation and communications outcomes are handled separately.
 */
export function assessPlanetaryApproach(transfer:ContinuousTransfer,target:Body):ApproachAssessment{
 if(target.kind!=='planet'||!Number.isFinite(target.radius)||target.radius<=0)throw new Error('Invalid encounter target');
 const {closestDistanceM,closestAltitudeM,closestRelativeSpeedMs}=transfer;
 if(![closestDistanceM,closestAltitudeM,closestRelativeSpeedMs].every(Number.isFinite)||
  closestDistanceM<0||closestRelativeSpeedMs<0||
  Math.abs((closestDistanceM-target.radius)-closestAltitudeM)>Math.max(1,closestDistanceM)*1e-10)
  throw new Error('Invalid encounter geometry');
 // An explicit, small near-planet science envelope, not an orbital capture radius.
 const encounterThresholdM=target.radius*10;
 const outcome:ApproachOutcome=closestAltitudeM<=0?'impact-risk':
  closestDistanceM<=encounterThresholdM?'flyby':'distant-miss';
 return {outcome,closestAltitudeM,closestDistanceM,encounterThresholdM,relativeSpeedMs:closestRelativeSpeedMs};
}

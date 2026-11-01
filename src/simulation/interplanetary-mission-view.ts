import type {MissionTimeline} from './interplanetary-mission-timeline';

export type InterplanetaryMissionPhase='scheduled'|'coasting'|'corrected'|'encountered'|'complete';
export type InterplanetaryMissionView=Readonly<{
 missionId:string;originId:string;targetId:string;phase:InterplanetaryMissionPhase;
 lastEventS:number|null;remainingMilestones:number;outcome:'pending'|'flyby'|'impact-risk'|'distant-miss';
 fuelRemainingKg:number;correctionDeltaVMs:number;
}>;

/** Derive mission state exclusively from a persisted, processed event cursor.
 * Unreached encounters are always pending even if the manifest precomputed
 * their physical outcome; future information must not leak to observers.
 */
export function interplanetaryMissionView(timeline:MissionTimeline):InterplanetaryMissionView{
 const {manifest,cursor,missionId}=timeline;
 const events=manifest.milestones;
 if(!Number.isSafeInteger(cursor)||cursor<0||cursor>events.length)
  throw new Error('Invalid mission progress cursor');
 const consumed=events.slice(0,cursor);
 const has=(kind:string):boolean=>consumed.some(event=>event.kind===kind);
 const phase:InterplanetaryMissionPhase=has('arrival')?'complete':
  has('closest-approach')?'encountered':has('course-correction')?'corrected':
  has('departure')?'coasting':'scheduled';
 return {
  missionId,originId:manifest.originId,targetId:manifest.targetId,phase,
  lastEventS:consumed.length?consumed[consumed.length-1].timeS:null,
  remainingMilestones:events.length-cursor,
  outcome:has('closest-approach')?manifest.outcome:'pending',
  fuelRemainingKg:has('course-correction')?manifest.remainingFuelKg:
   manifest.remainingFuelKg+manifest.courseCorrectionFuelKg,
  correctionDeltaVMs:has('course-correction')?manifest.courseCorrectionDeltaVMs:0,
 };
}

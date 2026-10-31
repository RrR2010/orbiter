import type {InterplanetaryMissionManifest,InterplanetaryMissionMilestone} from './interplanetary-mission-manifest';

export type MissionTimeline=Readonly<{
 missionId:string;manifest:InterplanetaryMissionManifest;cursor:number;timeS:number;
}>;
export type TimelineAdvance=Readonly<{
 timeline:MissionTimeline;emitted:readonly InterplanetaryMissionMilestone[];
}>;

/** Start a persistent event cursor without issuing any historical milestones. */
export function createMissionTimeline(missionId:string,manifest:InterplanetaryMissionManifest):MissionTimeline{
 if(!missionId||manifest.milestones.length===0||
  manifest.milestones.some((m,i)=>!Number.isFinite(m.timeS)||
   m.timeS<manifest.departureS||m.timeS>manifest.arrivalS||
   i>0&&m.timeS<manifest.milestones[i-1].timeS))
  throw new Error('Invalid mission event timeline');
 return {missionId,manifest,cursor:0,timeS:manifest.departureS};
}

/** Consume each physical milestone once regardless of advance partitioning. */
export function advanceMissionTimeline(timeline:MissionTimeline,untilS:number):TimelineAdvance{
 const {manifest,cursor,timeS}=timeline;
 if(!Number.isFinite(untilS)||untilS<timeS||
  !Number.isSafeInteger(cursor)||cursor<0||cursor>manifest.milestones.length)
  throw new Error('Invalid mission timeline advance');
 let next=cursor;
 while(next<manifest.milestones.length&&manifest.milestones[next].timeS<=untilS)next++;
 return {timeline:{...timeline,cursor:next,timeS:untilS},
  emitted:manifest.milestones.slice(cursor,next)};
}

/** Validate untrusted serialized cursor positions before replaying events. */
export function parseMissionTimeline(raw:string):MissionTimeline{
 const value:unknown=JSON.parse(raw);
 if(!value||typeof value!=='object')throw new Error('Invalid persisted timeline');
 const t=value as MissionTimeline;
 if(typeof t.missionId!=='string'||!t.missionId||!t.manifest||
  !Array.isArray(t.manifest.milestones)||!Number.isFinite(t.timeS)||
  !Number.isSafeInteger(t.cursor)||t.cursor<0||t.cursor>t.manifest.milestones.length||
  !Number.isFinite(t.manifest.departureS)||!Number.isFinite(t.manifest.arrivalS)||
  t.timeS<t.manifest.departureS||
  t.manifest.milestones.some((m,i)=>!m||!Number.isFinite(m.timeS)||
   m.timeS<t.manifest.departureS||m.timeS>t.manifest.arrivalS||
   i>0&&m.timeS<t.manifest.milestones[i-1].timeS||
   (i<t.cursor?m.timeS>t.timeS:m.timeS<=t.timeS)))
  throw new Error('Invalid persisted timeline');
 return t;
}

import type {Civilization,Mission,SpaceEvent} from './civilization';
import type {MissionTimeline} from './interplanetary-mission-timeline';
import {bodyFrame,fromHeliocentricProbe,fromLocalFlight,solarFrame} from './reference-frames';
import type {FlightState} from './spaceflight/types';
import type {DomainEvent,MissionOperation,MissionOperationRecord,OperationKind,OperationParameters,PhysicalCheckpoint} from './mission-operations';
import {validateMissionOperationRecord} from './mission-operations';

type Draft=Readonly<{id:string;epochS:number;kind:OperationKind;parameters:OperationParameters}>;
const compare=<T extends {epochS:number;id:string}>(a:T,b:T):number=>a.epochS-b.epochS||a.id.localeCompare(b.id);
const localId=(id:string):string=>`local/${id}`;
const probeId=(id:string):string=>`probe/${id}`;
const eventId=(id:string):string=>`source/${id}`;
const mark=(ops:MissionOperation[],checkpoints:readonly PhysicalCheckpoint[],events:readonly DomainEvent[]):MissionOperation[]=>{
 const byOperation=(id:string)=>events.filter(e=>e.operationId===id).sort(compare);
 return ops.map(op=>{
  const lastEvent=byOperation(op.id).at(-1);
  if(lastEvent&&!(op.kind==='launch'&&lastEvent.kind==='preparation'))return {...op,status:lastEvent.outcome==='failure'?'failed':'confirmed',
   result:lastEvent.outcome==='failure'?{kind:'failed' as const,eventId:lastEvent.id}:{kind:'confirmed' as const,eventId:lastEvent.id}};
  const checkpoint=checkpoints.filter(cp=>cp.operationId===op.id).sort(compare).at(-1);
  return checkpoint?{...op,status:'observed' as const,result:{kind:'observed' as const,checkpointId:checkpoint.id}}:op;
 });
};
function assemble(missionId:string,ownerId:string,entityId:string,pipeline:MissionOperationRecord['pipeline'],untilS:number,
 drafts:readonly Draft[],checkpoints:readonly PhysicalCheckpoint[],events:readonly DomainEvent[]):MissionOperationRecord{
 const sorted=[...drafts].sort(compare);
 const operations:MissionOperation[]=sorted.map((draft,i)=>({
  ...draft,missionId,ownerId,entityId,sequence:i,
  preconditions:i?[sorted[i-1].id]:[],status:'planned',result:{kind:'pending'}
 }));
 const record:MissionOperationRecord={missionId,ownerId,entityId,pipeline,observedUntilS:untilS,
  operations:mark(operations,checkpoints,events),checkpoints:[...checkpoints].sort(compare),events:[...events].sort(compare)};
 validateMissionOperationRecord(record);
 return record;
}
function strategicEvent(missionId:string,operationId:string,event:SpaceEvent,kind:DomainEvent['kind']):DomainEvent{
 return {id:eventId(event.id),missionId,operationId,epochS:event.time,kind,
  source:'strategic-event',sourceId:event.id,
  outcome:event.kind==='failure'?'failure':event.kind==='success'?'success':'recorded',detail:event.detail};
}

/** Adapt persisted local V2 checkpoint facts and bounded scheduler log without replay. */
export function localOperationRecord(c:Readonly<Civilization>,mission:Readonly<Mission>):MissionOperationRecord{
 const id=mission.id,entityId=localId(id),ownerId=c.id,untilS=c.time;
 const launchId=`operation/${entityId}/launch`,endId=`operation/${entityId}/assessment`;
 const drafts:Draft[]=[{id:launchId,epochS:mission.startedAt,kind:'launch',
  parameters:{kind:'launch',originId:mission.originId}}];
 const cp:PhysicalCheckpoint[]=[];
 const flight=mission.flight;
 if(flight){
  flight.checkpoints.forEach((checkpoint,i)=>{
   const kind:OperationKind=checkpoint.kind==='burn-start'||checkpoint.kind==='burn-progress'||checkpoint.kind==='burn-end'?'burn':
    checkpoint.kind==='coast'?'coast':'assessment';
   const operationId=`operation/${entityId}/checkpoint/${i}`;
   drafts.push({id:operationId,epochS:checkpoint.timeS,kind,
    parameters:kind==='burn'?{kind:'burn',thrustN:flight.plan.thrustN,ispS:flight.plan.ispS}:
     kind==='coast'?{kind:'coast',centralBodyId:mission.originId}:
      {kind:'assessment',targetId:mission.targetId}});
   if(mission.status!=='preparing'&&checkpoint.timeS<=untilS)
    cp.push({id:`checkpoint/${entityId}/${i}`,missionId:id,operationId,epochS:checkpoint.timeS,
     frameId:bodyFrame(mission.originId),state:fromLocalFlight(entityId,mission.originId,checkpoint.state),
     source:'local-flight-v2',status:'physical-observation'});
  });
 }
 drafts.push({id:endId,epochS:mission.resolvedAt||flight?.terminal.timeS||mission.launchAt,kind:'assessment',
  parameters:{kind:'assessment',targetId:mission.targetId}});
 const events:DomainEvent[]=[];
 for(const event of c.events){
  if(event.missionId!==id||event.time>untilS)continue;
  const operationId=event.kind==='preparation'||event.kind==='launch'?launchId:endId;
  const kind:DomainEvent['kind']=event.kind==='preparation'?'preparation':event.kind==='launch'?'ignition':
   event.kind==='success'?'completion':'failure';
  if(event.kind!=='preparation'&&event.kind!=='launch'&&event.kind!=='success'&&event.kind!=='failure')continue;
  events.push(strategicEvent(id,operationId,event,kind));
 }
 return assemble(id,ownerId,entityId,'local',untilS,drafts,cp,events);
}
const milestoneKind=(kind:MissionTimeline['manifest']['milestones'][number]['kind']):OperationKind=>
 kind==='departure'?'launch':kind==='course-correction'?'correction':kind==='closest-approach'?'observation':'assessment';
const milestoneEventKind=(kind:MissionTimeline['manifest']['milestones'][number]['kind']):DomainEvent['kind']=>
 kind==='departure'?'departure':kind==='course-correction'?'correction':kind==='closest-approach'?'encounter':'arrival';

/** Manifest is intent; only consumed cursor entries are confirmed events. */
export function interplanetaryOperationRecord(c:Readonly<Civilization>,timeline:Readonly<MissionTimeline>):MissionOperationRecord{
 const id=timeline.missionId,entityId=probeId(id),ownerId=c.id,untilS=c.time,{manifest}=timeline;
 const drafts:Draft[]=manifest.milestones.map((m,i)=>{
  const kind=milestoneKind(m.kind);
  return {id:`operation/${entityId}/milestone/${i}`,epochS:m.timeS,kind,
   parameters:kind==='launch'?{kind:'launch' as const,originId:manifest.originId}:
    kind==='correction'?{kind:'correction' as const,deltaVMs:manifest.courseCorrectionDeltaVMs,fuelSpentKg:manifest.courseCorrectionFuelKg}:
     kind==='observation'?{kind:'observation' as const,targetId:manifest.targetId}:
      {kind:'assessment' as const,targetId:manifest.targetId}};
 });
 const events:DomainEvent[]=[];
 for(let i=0;i<timeline.cursor;i++){
  const m=manifest.milestones[i];
  if(m.timeS>untilS)throw new Error('Future milestone already consumed');
  const outcome=m.kind==='closest-approach'&&manifest.outcome!=='flyby'?'failure':
   m.kind==='closest-approach'?'success':'recorded';
  events.push({id:`milestone/${entityId}/${i}`,missionId:id,
   operationId:`operation/${entityId}/milestone/${i}`,epochS:m.timeS,
   kind:milestoneEventKind(m.kind),source:'timeline-milestone',sourceId:`${i}`,
   outcome,detail:m.kind==='closest-approach'?manifest.outcome:m.detail});
 }
 const cp:PhysicalCheckpoint[]=[];
 const departureIndex=manifest.milestones.findIndex(m=>m.kind==='departure');
 const correctionIndex=manifest.milestones.findIndex(m=>m.kind==='course-correction');
 const departureConfirmed=departureIndex>=0&&departureIndex<timeline.cursor;
 const correctionConfirmed=correctionIndex>=0&&correctionIndex<timeline.cursor;
 const add=(name:string,state:FlightState,operationId:string):void=>{
  if(state.timeS<=untilS)cp.push({id:`checkpoint/${entityId}/${name}`,missionId:id,operationId,
   epochS:state.timeS,frameId:solarFrame,state:fromHeliocentricProbe(entityId,state),
   status:'physical-observation',source:'interplanetary-manifest'});
 };
 if(departureConfirmed&&manifest.preCorrectionCoastStart){
  const handoff=manifest.preCorrectionCoastStart;
  const handoffId=`operation/${entityId}/handoff`;
  drafts.push({id:handoffId,epochS:handoff.timeS,kind:'handoff',
   parameters:{kind:'handoff',fromFrameId:bodyFrame(manifest.originId),toFrameId:solarFrame}});
  add('handoff',handoff,handoffId);
 }
 if(departureConfirmed&&manifest.planetaryEscapeStart){
  // Local escape is not already heliocentric; its untransformed state is never mislabeled solar.
  // The existing manifest keeps it available for M4, without inventing a confirmed solar checkpoint.
 }
 if(correctionConfirmed)add('correction',manifest.correctedCoastStart,
  `operation/${entityId}/milestone/${correctionIndex}`);
 const encounterIndex=manifest.milestones.findIndex(m=>m.kind==='closest-approach');
 const observationOp=`operation/${entityId}/milestone/${encounterIndex}`;
 for(const event of c.events){
  if(event.time>untilS)continue;
  if(event.kind==='research'&&event.detail.startsWith('Scientific observation received: ')){
   const observationId=event.detail.slice('Scientific observation received: '.length);
   if(!observationId.startsWith(id+':')||!c.science?.receivedIds.includes(observationId))continue;
   const opId=`operation/${entityId}/transmit/${observationId}`;
   drafts.push({id:opId,epochS:manifest.milestones[encounterIndex].timeS,kind:'transmit',
    parameters:{kind:'transmit',observationId}});
   events.push(strategicEvent(id,opId,event,'science-received'));
  }else if(event.missionId===id&&event.kind==='failure'&&event.detail.startsWith('Interplanetary radio link out of range')){
   events.push(strategicEvent(id,observationOp,event,'radio-failure'));
  }
 }
 for(const item of c.scienceInbox?.pending??[]){
  if(!item.observation.observationId.startsWith(id+':'))continue;
  const observationId=item.observation.observationId,opId=`operation/${entityId}/transmit/${observationId}`;
  if(!drafts.some(d=>d.id===opId))drafts.push({id:opId,epochS:item.transmission.observationAtS,kind:'transmit',
   parameters:{kind:'transmit',observationId}});
 }
 return assemble(id,ownerId,entityId,'interplanetary',untilS,drafts,cp,events);
}

/** Single public read entrypoint; never changes scheduler, persisted cursors or flight outcomes. */
export function missionOperationRecords(c:Readonly<Civilization>):readonly MissionOperationRecord[]{
 return [...c.missions.map(m=>localOperationRecord(c,m)),
  ...(c.interplanetaryTimelines??[]).map(t=>interplanetaryOperationRecord(c,t))]
  .sort((a,b)=>a.missionId.localeCompare(b.missionId)||a.pipeline.localeCompare(b.pipeline));
}

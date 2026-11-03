import type {Civilization,Mission,SpaceEvent} from './civilization';
import type {MissionTimeline} from './interplanetary-mission-timeline';
import {bodyFrame,fromHeliocentricProbe,fromLocalFlight,solarFrame} from './reference-frames';
import type {FlightState} from './spaceflight/types';
import type {DomainEvent,MissionOperation,MissionOperationRecord,OperationKind,OperationParameters,MissionOutcome,PhysicalCheckpoint} from './mission-operations';
import {validateMissionOperationRecord} from './mission-operations';

type Draft=Readonly<{id:string;epochS:number;kind:OperationKind;parameters:OperationParameters}>;
const compare=<T extends {epochS:number;id:string}>(a:T,b:T):number=>a.epochS-b.epochS||a.id.localeCompare(b.id);
const localId=(id:string):string=>`local/${id}`;
const probeId=(id:string):string=>`probe/${id}`;
const eventId=(id:string):string=>`source/${id}`;
const mark=(ops:MissionOperation[],checkpoints:readonly PhysicalCheckpoint[],events:readonly DomainEvent[]):MissionOperation[]=>{
 const lastEventByOperation=new Map<string,DomainEvent>(),lastCheckpointByOperation=new Map<string,PhysicalCheckpoint>();
 for(const event of [...events].sort(compare))lastEventByOperation.set(event.operationId,event);
 for(const checkpoint of [...checkpoints].sort(compare))lastCheckpointByOperation.set(checkpoint.operationId,checkpoint);
 return ops.map((op):MissionOperation=>{
  const lastEvent=lastEventByOperation.get(op.id);
  if(lastEvent&&!(op.kind==='launch'&&lastEvent.kind==='preparation')){
   if(lastEvent.outcome==='failure')return {...op,status:'failed',result:{kind:'failed',eventId:lastEvent.id}};
   return {...op,status:'confirmed',result:{kind:'confirmed',eventId:lastEvent.id}};
  }
  const checkpoint=lastCheckpointByOperation.get(op.id);
  return checkpoint?{...op,status:'observed' as const,result:{kind:'observed' as const,checkpointId:checkpoint.id}}:op;
 });
};
function assemble(missionId:string,ownerId:string,entityId:string,pipeline:MissionOperationRecord['pipeline'],untilS:number,
 drafts:readonly Draft[],checkpoints:readonly PhysicalCheckpoint[],events:readonly DomainEvent[],outcome:MissionOutcome):MissionOperationRecord{
 const sorted=drafts.map((draft,index)=>({...draft,index})).sort((a,b)=>a.epochS-b.epochS||a.index-b.index);
 const operations:MissionOperation[]=sorted.map((draft,i):MissionOperation=>({
  id:draft.id,epochS:draft.epochS,kind:draft.kind,parameters:draft.parameters,
  missionId,ownerId,entityId,sequence:i,
  preconditions:i?[sorted[i-1].id]:[],status:'planned',result:{kind:'pending'}
 }));
 const record:MissionOperationRecord={missionId,ownerId,entityId,pipeline,observedUntilS:untilS,
  operations:mark(operations,checkpoints,events),checkpoints:[...checkpoints].sort(compare),events:[...events].sort(compare),outcome};
 validateMissionOperationRecord(record);
 return record;
}
function strategicEvent(missionId:string,operationId:string,event:SpaceEvent,kind:DomainEvent['kind'],suffix=''):DomainEvent{
 return {id:eventId(event.id)+suffix,missionId,operationId,epochS:event.time,kind,
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
 const assessmentAt=flight?.checkpoints.find(checkpoint=>
  (checkpoint.kind==='goal'||checkpoint.kind==='partial'||checkpoint.kind==='abort'||checkpoint.kind==='impact')&&
  !checkpoint.reason.startsWith('Ascent '))?.timeS;
 const endEpoch=assessmentAt??(mission.resolvedAt>0?mission.resolvedAt:flight?.terminal.timeS);
 if(endEpoch!==undefined)drafts.push({id:endId,epochS:endEpoch,kind:'assessment',
  parameters:{kind:'assessment',targetId:mission.targetId}});
 if(flight){
  let currentBurn:string|null=null,burnSerial=0,coastSerial=0;
  flight.checkpoints.forEach((checkpoint,i)=>{
   let operationId:string;
   if(checkpoint.reason==='Physical liftoff'||checkpoint.reason==='Ascent telemetry checkpoint'||
    checkpoint.reason.startsWith('Ascent ')){
    operationId=launchId;
   }else if(checkpoint.kind==='burn-start'){
    currentBurn=`operation/${entityId}/burn/${burnSerial++}`;
    operationId=currentBurn;
    drafts.push({id:operationId,epochS:checkpoint.timeS,kind:'burn',
     parameters:{kind:'burn',thrustN:flight.plan.thrustN,ispS:flight.plan.ispS}});
   }else if((checkpoint.kind==='burn-progress'||checkpoint.kind==='burn-end')&&currentBurn){
    operationId=currentBurn;
    if(checkpoint.kind==='burn-end')currentBurn=null;
   }else if(checkpoint.kind==='coast'){
    operationId=`operation/${entityId}/coast/${coastSerial++}`;
    drafts.push({id:operationId,epochS:checkpoint.timeS,kind:'coast',
     parameters:{kind:'coast',centralBodyId:mission.originId}});
   }else{
    operationId=endId;
   }
   if(mission.status!=='preparing'&&checkpoint.timeS<=untilS)
    cp.push({id:`checkpoint/${entityId}/${i}`,missionId:id,operationId,epochS:checkpoint.timeS,
     frameId:bodyFrame(mission.originId),checkpointKind:checkpoint.kind,detail:checkpoint.reason,
     state:fromLocalFlight(entityId,mission.originId,checkpoint.state),
     source:'local-flight-v2',status:'physical-observation'});
  });
 }
 const events:DomainEvent[]=[];
 for(const event of c.events){
  if(event.missionId!==id||event.time>untilS||!['preparation','launch','success','failure'].includes(event.kind))continue;
  const operationId=event.kind==='preparation'||event.kind==='launch'?launchId:endId;
  if(operationId===endId&&!drafts.some(d=>d.id===endId))drafts.push({id:endId,epochS:event.time,kind:'assessment',
   parameters:{kind:'assessment',targetId:mission.targetId}});
  const kind:DomainEvent['kind']=event.kind==='preparation'?'preparation':event.kind==='launch'?'ignition':
   event.kind==='success'?'completion':'failure';
  events.push(strategicEvent(id,operationId,event,kind));
 }
 const resolved=mission.status==='success'||mission.status==='failure';
 const outcome:MissionOutcome=resolved?{kind:'local',resolvedAtS:mission.resolvedAt,
  strategic:mission.status==='success'?'success':'failure',physical:flight?.outcome??null,reason:flight?.reason??null}:
  {kind:'pending'};
 return assemble(id,ownerId,entityId,'local',untilS,drafts,cp,events,outcome);
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
    kind==='correction'?{kind:'correction' as const,deltaVMs:i<timeline.cursor?manifest.courseCorrectionDeltaVMs:null,fuelSpentKg:i<timeline.cursor?manifest.courseCorrectionFuelKg:null}:
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
   epochS:state.timeS,frameId:solarFrame,checkpointKind:name==='handoff'?'handoff':'correction',detail:null,
   state:fromHeliocentricProbe(entityId,state),
   status:'physical-observation',source:'interplanetary-manifest'});
 };
 if(departureConfirmed&&manifest.preCorrectionCoastStart){
  const handoff=manifest.preCorrectionCoastStart;
  const handoffId=`operation/${entityId}/handoff`;
  drafts.push({id:handoffId,epochS:handoff.timeS,kind:'handoff',
   parameters:{kind:'handoff',fromFrameId:bodyFrame(manifest.originId),toFrameId:solarFrame}});
  add('handoff',handoff,handoffId);
 }
 // Planetary escape has a local state; never label it solar without a frame transform.
 if(correctionConfirmed)add('correction',manifest.correctedCoastStart,
  `operation/${entityId}/milestone/${correctionIndex}`);
 const encounterIndex=manifest.milestones.findIndex(m=>m.kind==='closest-approach');
 for(const event of c.events){
  if(event.time>untilS)continue;
  if(event.kind==='research'&&event.detail.startsWith('Scientific observation received: ')){
   const observationId=event.detail.slice('Scientific observation received: '.length);
   if(!observationId.startsWith(id+':')||!c.science?.receivedIds.includes(observationId))continue;
   const opId=`operation/${entityId}/transmit/${observationId}`;
   drafts.push({id:opId,epochS:manifest.milestones[encounterIndex].timeS,kind:'transmit',
    parameters:{kind:'transmit',observationId}});
   events.push(strategicEvent(id,opId,event,'science-received',`/science/${observationId}`));
  }else if(event.missionId===id&&event.kind==='failure'&&event.detail.startsWith('Interplanetary radio link out of range')){
   const opId=`operation/${entityId}/transmit/radio-failure/${event.id}`;
   drafts.push({id:opId,epochS:manifest.milestones[encounterIndex].timeS,kind:'transmit',
    parameters:{kind:'transmit',observationId:null}});
   events.push(strategicEvent(id,opId,event,'radio-failure'));
  }
 }
 for(const item of c.scienceInbox?.pending??[]){
  if(!item.observation.observationId.startsWith(id+':'))continue;
  const observationId=item.observation.observationId,opId=`operation/${entityId}/transmit/${observationId}`;
  if(!drafts.some(d=>d.id===opId))drafts.push({id:opId,epochS:item.transmission.observationAtS,kind:'transmit',
   parameters:{kind:'transmit',observationId}});
 }
 const encounterConfirmed=encounterIndex>=0&&encounterIndex<timeline.cursor;
 const outcome:MissionOutcome=encounterConfirmed?{kind:'interplanetary',
  resolvedAtS:manifest.milestones[encounterIndex].timeS,result:manifest.outcome}:{kind:'pending'};
 return assemble(id,ownerId,entityId,'interplanetary',untilS,drafts,cp,events,outcome);
}

/** Single public read entrypoint; never changes scheduler, persisted cursors or flight outcomes. */
export function missionOperationRecords(c:Readonly<Civilization>):readonly MissionOperationRecord[]{
 return [...c.missions.map(m=>localOperationRecord(c,m)),
  ...(c.interplanetaryTimelines??[]).map(t=>interplanetaryOperationRecord(c,t))]
  .sort((a,b)=>a.missionId.localeCompare(b.missionId)||a.pipeline.localeCompare(b.pipeline));
}

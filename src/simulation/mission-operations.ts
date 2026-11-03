import type {EntityId,FrameId,StateVector} from './reference-frames';

/** M3 is a read-only domain projection, not an execution queue. */
export type OperationKind='launch'|'burn'|'coast'|'handoff'|'correction'|'observation'|'transmit'|'assessment';
export type OperationStatus='planned'|'observed'|'confirmed'|'failed';
export type OperationParameters=
 |Readonly<{kind:'launch';originId:EntityId}>
 |Readonly<{kind:'burn';thrustN:number|null;ispS:number|null}>
 |Readonly<{kind:'coast';centralBodyId:EntityId}>
 |Readonly<{kind:'handoff';fromFrameId:FrameId;toFrameId:FrameId}>
 |Readonly<{kind:'correction';deltaVMs:number|null;fuelSpentKg:number|null}>
 |Readonly<{kind:'observation';targetId:EntityId}>
 |Readonly<{kind:'transmit';observationId:string|null}>
 |Readonly<{kind:'assessment';targetId:EntityId}>;

export type OperationProgress=
 |Readonly<{status:'planned';result:Readonly<{kind:'pending'}>}>
 |Readonly<{status:'observed';result:Readonly<{kind:'observed';checkpointId:string}>}>
 |Readonly<{status:'confirmed';result:Readonly<{kind:'confirmed';eventId:string}>}>
 |Readonly<{status:'failed';result:Readonly<{kind:'failed';eventId:string}>}>;
export type MissionOperation=Readonly<{
 id:string;missionId:string;ownerId:EntityId;entityId:EntityId;
 sequence:number;epochS:number;kind:OperationKind;parameters:OperationParameters;
 preconditions:readonly string[];
}> & OperationProgress;
export type PhysicalCheckpoint=Readonly<{
 id:string;missionId:string;operationId:string;epochS:number;frameId:FrameId;
 checkpointKind:'coast'|'burn-start'|'burn-progress'|'burn-end'|'impact'|'goal'|'partial'|'abort'|'handoff'|'correction';
 detail:string|null;state:StateVector;source:'local-flight-v2'|'interplanetary-manifest';
 status:'physical-observation';
}>;
export type DomainEvent=Readonly<{
 id:string;missionId:string;operationId:string;epochS:number;
 kind:'preparation'|'ignition'|'completion'|'failure'|'departure'|'correction'|
  'encounter'|'arrival'|'science-received'|'radio-failure';
 source:'strategic-event'|'timeline-milestone';sourceId:string;
 outcome:'success'|'failure'|'recorded';detail:string;
}>;
/** A resolved outcome is authoritative even if its bounded event log was trimmed. */
export type MissionOutcome=
 |Readonly<{kind:'pending'}>
 |Readonly<{kind:'local';resolvedAtS:number;strategic:'success'|'failure';
   physical:'achieved'|'partial'|'failed'|null;reason:string|null}>
 |Readonly<{kind:'interplanetary';resolvedAtS:number;result:'flyby'|'impact-risk'|'distant-miss'}>;
export type MissionOperationRecord=Readonly<{
 missionId:string;ownerId:EntityId;entityId:EntityId;
 pipeline:'local'|'interplanetary';observedUntilS:number;outcome:MissionOutcome;
 operations:readonly MissionOperation[];
 checkpoints:readonly PhysicalCheckpoint[];
 events:readonly DomainEvent[];
}>;

/** Reject duplicated identities, temporal inversions and dangling causal references. */
export function validateMissionOperationRecord(record:MissionOperationRecord):void{
 const seen=new Set<string>(),ops=new Map<string,MissionOperation>();
 const validTime=(time:number):boolean=>Number.isFinite(time)&&time>=0&&time<=record.observedUntilS;
 if(!record.missionId||!record.ownerId||!record.entityId||!Number.isFinite(record.observedUntilS)||record.observedUntilS<0)
  throw new Error('Invalid operation record identity or clock');
 if(record.outcome.kind!=='pending'&&(!validTime(record.outcome.resolvedAtS)||
  record.pipeline!==(record.outcome.kind==='local'?'local':'interplanetary')))
  throw new Error('Invalid authoritative mission outcome');
 let last=-Infinity;
 for(const op of record.operations){
  if(seen.has(op.id)||!op.id||op.missionId!==record.missionId||op.ownerId!==record.ownerId||
   op.entityId!==record.entityId||!Number.isFinite(op.epochS)||op.epochS<0||
   op.epochS<last||op.sequence!==ops.size||op.parameters.kind!==op.kind)throw new Error('Invalid operation order');
  seen.add(op.id);ops.set(op.id,op);last=op.epochS;
  if(op.preconditions.some(id=>id===op.id||!ops.has(id)))throw new Error('Invalid operation predecessor');
 }
 let prev=-Infinity;
 for(const cp of record.checkpoints){
  if(seen.has(cp.id)||!validTime(cp.epochS)||cp.epochS<prev||!ops.has(cp.operationId)||cp.epochS<ops.get(cp.operationId)!.epochS||
   cp.missionId!==record.missionId||cp.state.entityId!==record.entityId||
   cp.state.epochS!==cp.epochS||cp.frameId!==cp.state.frameId)throw new Error('Invalid physical checkpoint');
  seen.add(cp.id);prev=cp.epochS;
 }
 prev=-Infinity;
 for(const event of record.events){
  if(seen.has(event.id)||!validTime(event.epochS)||event.epochS<prev||
   !ops.has(event.operationId)||event.epochS<ops.get(event.operationId)!.epochS||event.missionId!==record.missionId)
   throw new Error('Invalid domain event');
  seen.add(event.id);prev=event.epochS;
 }
 const cpIds=new Set(record.checkpoints.map(cp=>cp.id)),eventIds=new Set(record.events.map(e=>e.id));
 for(const op of record.operations){
  if((op.result.kind==='pending')!==(op.status==='planned')||
   (op.result.kind==='observed')!==(op.status==='observed')||
   (op.result.kind==='failed')!==(op.status==='failed')||
   (op.result.kind==='confirmed')!==(op.status==='confirmed'))throw new Error('Inconsistent operation status');
  if(op.result.kind==='observed'&&!cpIds.has(op.result.checkpointId)||
   (op.result.kind==='confirmed'||op.result.kind==='failed')&&!eventIds.has(op.result.eventId))
   throw new Error('Unresolved operation result');
 }
}

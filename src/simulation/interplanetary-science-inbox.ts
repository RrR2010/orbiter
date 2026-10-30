import type {GravityObservation,ScientificRecord} from './scientific-knowledge';
import type {ScienceTransmission} from './interplanetary-communications';
import {deliverScientificObservation} from './interplanetary-science-delivery';

export type PendingScience=Readonly<{transmission:ScienceTransmission;observation:GravityObservation}>;
export type ScienceInbox=Readonly<{pending:readonly PendingScience[]}>;
export const MAX_PENDING_SCIENCE=128;

/** Queue a future reception without changing scientific knowledge.
 * The queue is plain JSON and can be persisted alongside strategic state.
 */
export function enqueueScience(inbox:ScienceInbox,item:PendingScience):ScienceInbox{
 const {transmission,observation}=item;
 if(!observation.observationId||transmission.targetId!==observation.bodyId||
  !Number.isFinite(transmission.receivedAtS)||!Number.isFinite(transmission.observationAtS)||
  transmission.receivedAtS<transmission.observationAtS)throw new Error('Invalid pending science');
 if(inbox.pending.some(p=>p.observation.observationId===observation.observationId))return inbox;
 if(inbox.pending.length>=MAX_PENDING_SCIENCE)throw new Error('Science inbox capacity exceeded');
 return {pending:[...inbox.pending,item].sort((a,b)=>
  a.transmission.receivedAtS-b.transmission.receivedAtS||
  a.observation.observationId.localeCompare(b.observation.observationId))};
}

/** Deliver only due messages, retaining future messages for save/reload and time warp. */
export function drainScience(inbox:ScienceInbox,record:ScientificRecord,nowS:number):
 Readonly<{inbox:ScienceInbox;record:ScientificRecord;deliveredIds:readonly string[]}>{
 if(!Number.isFinite(nowS)||nowS<0)throw new Error('Invalid science clock');
 let updated=record;
 const pending:PendingScience[]=[],deliveredIds:string[]=[];
 for(const item of inbox.pending){
  if(item.transmission.receivedAtS>nowS){pending.push(item);continue;}
  const result=deliverScientificObservation(updated,item.transmission,item.observation,nowS);
  updated=result.record;
  if(result.delivered)deliveredIds.push(item.observation.observationId);
 }
 return {inbox:{pending},record:updated,deliveredIds};
}

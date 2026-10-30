import type {ScientificRecord,GravityObservation} from './scientific-knowledge';
import {receiveGravityObservation} from './scientific-knowledge';
import type {ScienceTransmission} from './interplanetary-communications';

export type ReceivedScience=Readonly<{record:ScientificRecord;delivered:boolean}>;

/** Apply an observation only at/after light-time reception, once per observation ID.
 * The scheduler must invoke this at the actual event time, not at emission.
 * A failed link is represented by transmitted=false and grants no knowledge.
 */
export function deliverScientificObservation(
 record:ScientificRecord,transmission:ScienceTransmission,observation:GravityObservation,nowS:number,
):ReceivedScience{
 if(!Number.isFinite(nowS)||nowS<0||!Number.isFinite(transmission.observationAtS)||
  !Number.isFinite(transmission.receivedAtS)||transmission.receivedAtS<transmission.observationAtS||
  transmission.targetId!==observation.bodyId)throw new Error('Invalid science delivery');
 if(nowS<transmission.receivedAtS||!observation.transmitted)return {record,delivered:false};
 const updated=receiveGravityObservation(record,observation);
 return {record:updated,delivered:updated!==record};
}

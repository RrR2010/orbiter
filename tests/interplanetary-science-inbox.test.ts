import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {initialScientificRecord} from '../src/simulation/scientific-knowledge';
import {enqueueScience,drainScience,type ScienceInbox} from '../src/simulation/interplanetary-science-inbox';

describe('persistable science inbox',()=>{
 const world=generateWorld('inbox-checkpoint'),record=initialScientificRecord(world);
 const [origin,target]=world.bodies.filter(b=>b.kind==='planet');
 const item=(id:string,receivedAtS:number)=>({
  transmission:{originId:origin.id,targetId:target.id,observationAtS:100,receivedAtS,
   distanceM:3e11,signalTravelS:receivedAtS-100},
  observation:{bodyId:target.id,observationId:id,measuredGravity:record.knowledge[target.id].gravity.value*1.05,relativeError:.1,transmitted:true},
 });
 it('survives JSON roundtrip and never grants future knowledge',()=>{
  const inbox=enqueueScience({pending:[]},item('a',1100));
  const restored=JSON.parse(JSON.stringify(inbox)) as ScienceInbox;
  const early=drainScience(restored,record,1099);
  expect(early.record).toBe(record);
  expect(early.inbox.pending).toHaveLength(1);
  expect(drainScience(early.inbox,early.record,1100).deliveredIds).toEqual(['a']);
 });
 it('drains due observations in chronological order regardless of insertion order',()=>{
  const inbox=enqueueScience(enqueueScience({pending:[]},item('late',1300)),item('early',1100));
  const partial=drainScience(inbox,record,1200);
  expect(partial.deliveredIds).toEqual(['early']);
  expect(partial.inbox.pending.map(p=>p.observation.observationId)).toEqual(['late']);
  const final=drainScience(partial.inbox,partial.record,1400);
  expect(final.deliveredIds).toEqual(['late']);
  expect(final.record.knowledge[target.id].gravity.observations).toBe(2);
  expect(drainScience(final.inbox,final.record,1400).deliveredIds).toEqual([]);
 });
 it('deduplicates queued observations',()=>{
  const inbox=enqueueScience({pending:[]},item('same',1100));
  expect(enqueueScience(inbox,item('same',1100))).toBe(inbox);
 });
});

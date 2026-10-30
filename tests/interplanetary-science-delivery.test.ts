import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {initialScientificRecord} from '../src/simulation/scientific-knowledge';
import {orbitalPosition} from '../src/simulation/orbits';
import {scheduleScienceTransmission} from '../src/simulation/interplanetary-communications';
import {deliverScientificObservation} from '../src/simulation/interplanetary-science-delivery';

describe('science delivery after finite light travel',()=>{
 const world=generateWorld('phase-five-delivery');
 const [home,target]=world.bodies.filter(body=>body.kind==='planet');
 const timeS=1e6;
 const position=orbitalPosition(target.orbit!,timeS);
 const transmission=scheduleScienceTransmission(world,home.id,target.id,position,timeS);
 const original=initialScientificRecord(world);
 const measuredGravity=original.knowledge[target.id].gravity.value*1.1;
 const observation={bodyId:target.id,measuredGravity,relativeError:.05,transmitted:true,observationId:'probe-1:gravity'};
 it('does not apply knowledge before reception, even after the measurement',()=>{
  const pending=deliverScientificObservation(original,transmission,observation,(timeS+transmission.receivedAtS)/2);
  expect(pending.delivered).toBe(false);
  expect(pending.record).toBe(original);
 });
 it('updates only once at reception and is idempotent on replay',()=>{
  const received=deliverScientificObservation(original,transmission,observation,transmission.receivedAtS);
  expect(received.delivered).toBe(true);
  expect(received.record.knowledge[target.id].gravity.observations).toBe(1);
  expect(received.record.knowledge[target.id].gravity.uncertainty).toBeLessThan(original.knowledge[target.id].gravity.uncertainty);
  const replay=deliverScientificObservation(received.record,transmission,observation,transmission.receivedAtS+1000);
  expect(replay.delivered).toBe(false);
  expect(replay.record).toBe(received.record);
 });
 it('never learns from a failed transmission',()=>{
  const failed=deliverScientificObservation(original,transmission,{...observation,transmitted:false},transmission.receivedAtS+1);
  expect(failed.record).toBe(original);
  expect(failed.delivered).toBe(false);
 });
 it('rejects an observation from a different target',()=>{
  expect(()=>deliverScientificObservation(original,transmission,{...observation,bodyId:home.id},transmission.receivedAtS)).toThrow();
 });
});

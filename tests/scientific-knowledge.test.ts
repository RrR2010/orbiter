import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {initialScientificRecord,receiveGravityObservation} from '../src/simulation/scientific-knowledge';

describe('scientific knowledge',()=>{
 const world=generateWorld('phase-five-science');
 const first=world.bodies.find(body=>body.kind==='planet')!;
 it('has reproducible uncertain estimates without mutating the universe',()=>{
  const before=JSON.stringify(world);
  expect(initialScientificRecord(world)).toEqual(initialScientificRecord(world));
  expect(JSON.stringify(world)).toBe(before);
  const trueGravity=gravityForRadius(first.radius).muM3S2/first.radius**2;
  const estimate=initialScientificRecord(world).knowledge[first.id].gravity;
  expect(estimate.value/trueGravity).toBeGreaterThanOrEqual(.7);
  expect(estimate.value/trueGravity).toBeLessThanOrEqual(1.3);
  expect(estimate.uncertainty/estimate.value).toBeCloseTo(.45);
 });
 it('requires transmission and is idempotent on replay',()=>{
  const prior=initialScientificRecord(world);
  const observation={bodyId:first.id,measuredGravity:1.2,relativeError:.08,transmitted:false,observationId:'probe-1'};
  expect(receiveGravityObservation(prior,observation)).toBe(prior);
  const received=receiveGravityObservation(prior,{...observation,transmitted:true});
  expect(received.knowledge[first.id].gravity.observations).toBe(1);
  expect(received.knowledge[first.id].gravity.uncertainty).toBeLessThan(prior.knowledge[first.id].gravity.uncertainty);
  expect(receiveGravityObservation(received,{...observation,transmitted:true})).toBe(received);
  expect(receiveGravityObservation(JSON.parse(JSON.stringify(received)),{...observation,transmitted:true})).toEqual(received);
 });
 it('rejects malformed data without granting discovery',()=>{
  const state=initialScientificRecord(world);
  expect(()=>receiveGravityObservation(state,{bodyId:first.id,measuredGravity:NaN,relativeError:.1,transmitted:true,observationId:'bad'})).toThrow();
  expect(()=>receiveGravityObservation(state,{bodyId:'missing',measuredGravity:1,relativeError:.1,transmitted:true,observationId:'bad'})).toThrow();
 });
});

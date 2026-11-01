import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {scienceFromPhysicalFlyby} from '../src/simulation/interplanetary-observation';
import {deliverScientificObservation} from '../src/simulation/interplanetary-science-delivery';
import {initialScientificRecord} from '../src/simulation/scientific-knowledge';
import type {ContinuousTransfer} from '../src/simulation/interplanetary-continuous-transfer';

describe('scientific observation from classified approach',()=>{
 const world=generateWorld('physical-flyby-observation');
 const [home,target]=world.bodies.filter(b=>b.kind==='planet');
 const timeS=1e6;
 const state={position:{x:1e11,y:0},velocity:{x:0,y:30000},timeS,massKg:100,fuelKg:20};
 const transfer=(distance:number)=>({
  closestDistanceM:distance,closestAltitudeM:distance-target.radius,closestRelativeSpeedMs:3000,
  closestTimeS:timeS,escape:{heliocentric:state},
 }) as ContinuousTransfer;
 it('queues only a classified positive-altitude encounter without granting knowledge',()=>{
  const pending=scienceFromPhysicalFlyby(world,home.id,target.id,'probe-1',transfer(target.radius*2));
  expect(pending).not.toBeNull();
  expect(pending!.observation.observationId).toBe('probe-1:gravity:'+target.id);
  expect(pending!.transmission.receivedAtS).toBeGreaterThan(timeS);
  const record=initialScientificRecord(world);
  expect(deliverScientificObservation(record,pending!.transmission,pending!.observation,timeS).record).toBe(record);
  const received=deliverScientificObservation(record,pending!.transmission,pending!.observation,pending!.transmission.receivedAtS);
  expect(received.record.knowledge[target.id].gravity.observations).toBe(1);
  expect(scienceFromPhysicalFlyby(world,home.id,target.id,'probe-1',transfer(target.radius*2))).toEqual(pending);
 });
 it('does not produce observations for collision risk or distant misses',()=>{
  expect(scienceFromPhysicalFlyby(world,home.id,target.id,'probe-2',transfer(target.radius*.8))).toBeNull();
  expect(scienceFromPhysicalFlyby(world,home.id,target.id,'probe-3',transfer(target.radius*20))).toBeNull();
 });
});

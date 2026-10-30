import {describe,expect,it} from 'vitest';
import {advanceCivilization,createCivilization,parseCivilization,serializeCivilization} from '../src/simulation/civilization';
import {enqueueScience} from '../src/simulation/interplanetary-science-inbox';
import {generateWorld} from '../src/simulation/world';

describe('scientific reception in the civilization scheduler',()=>{
 const world=generateWorld('reception-scheduler');
 const setup=()=>{
  const c=createCivilization(world);
  const target=world.bodies.find(b=>b.kind==='planet'&&b.id!==c.homeId)!;
  const observation={bodyId:target.id,observationId:'probe:gravity:001',
   measuredGravity:c.science!.knowledge[target.id].gravity.value*1.1,relativeError:.05,transmitted:true};
  c.scienceInbox=enqueueScience(c.scienceInbox!,{observation,transmission:{
   originId:c.homeId,targetId:target.id,observationAtS:100,receivedAtS:500,
   signalTravelS:400,distanceM:400*299792458,
  }});
  return {c,target};
 };
 it('does not grant knowledge until the signal reaches home',()=>{
  const {c,target}=setup();
  advanceCivilization(c,world,499);
  expect(c.science!.knowledge[target.id].gravity.observations).toBe(0);
  expect(c.scienceInbox!.pending).toHaveLength(1);
  advanceCivilization(c,world,500);
  expect(c.science!.knowledge[target.id].gravity.observations).toBe(1);
  expect(c.scienceInbox!.pending).toHaveLength(0);
  expect(c.events.some(event=>event.time===500&&event.detail.includes('probe:gravity:001'))).toBe(true);
 });
 it('is independent of time partition and save/reload during a pending transmission',()=>{
  const {c:single}=setup(),{c:partitioned}=setup();
  advanceCivilization(single,world,1800);
  advanceCivilization(partitioned,world,250);
  const restored=parseCivilization(serializeCivilization(partitioned),world,250);
  advanceCivilization(restored,world,500);
  advanceCivilization(restored,world,1800);
  expect(serializeCivilization(restored)).toBe(serializeCivilization(single));
 });
 it('does not double-count a received observation on replay',()=>{
  const {c,target}=setup();
  advanceCivilization(c,world,500);
  advanceCivilization(c,world,1200);
  expect(c.science!.knowledge[target.id].gravity.observations).toBe(1);
 });
});

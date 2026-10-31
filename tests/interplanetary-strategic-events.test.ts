import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {prepareInterplanetaryMission} from '../src/simulation/interplanetary-mission-manifest';
import {createMissionTimeline} from '../src/simulation/interplanetary-mission-timeline';
import {createCivilization,advanceCivilization,parseCivilization,registerInterplanetaryTimeline,serializeCivilization} from '../src/simulation/civilization';

describe('strategic interplanetary milestones',()=>{
 const world=generateWorld('phase-five-injection');
 const [home,target]=world.bodies.filter(b=>b.kind==='planet');
 const vehicle={...designVehicle(gravityForRadius(home.radius),4,3000,.5),ispS:1e7};
 const manifest=prepareInterplanetaryMission(world,home.id,target.id,1e6,5e6,vehicle)!;
 const start=()=>{
  const civ=createCivilization(world);
  civ.nextAt=6e6;
  registerInterplanetaryTimeline(civ,createMissionTimeline('interplanetary-test',manifest));
  return civ;
 };
 it('emits identical real mission events across warp and time partitions',()=>{
  const single=start(),split=start();
  advanceCivilization(single,world,5e6);
  for(const time of [1e6,2e6,3e6,4e6,5e6])advanceCivilization(split,world,time);
  expect(split.events).toEqual(single.events);
  expect(split.interplanetaryTimelines).toEqual(single.interplanetaryTimelines);
  expect(split.time).toBe(5e6);
  expect(single.events.map(event=>event.time)).toEqual(manifest.milestones.map(m=>m.timeS));
  expect(single.events.length).toBe(manifest.milestones.length);
  expect(advanceCivilization(single,world,5e6)).toBe(0);
 });
 it('restores the event cursor without duplicating previous milestones',()=>{
  const civ=start();
  advanceCivilization(civ,world,3e6);
  const restored=parseCivilization(serializeCivilization(civ),world,civ.time);
  expect(restored.interplanetaryTimelines).toEqual(civ.interplanetaryTimelines);
  advanceCivilization(restored,world,5e6);
  expect(restored.events).toEqual((()=>{
   const uninterrupted=start();
   advanceCivilization(uninterrupted,world,5e6);
   return uninterrupted.events;
  })());
  expect(()=>registerInterplanetaryTimeline(restored,createMissionTimeline('interplanetary-test',manifest))).toThrow();
 });
});

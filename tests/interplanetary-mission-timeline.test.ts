import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {prepareInterplanetaryMission} from '../src/simulation/interplanetary-mission-manifest';
import {createMissionTimeline,advanceMissionTimeline,parseMissionTimeline} from '../src/simulation/interplanetary-mission-timeline';

describe('warp-safe interplanetary mission event cursor',()=>{
 const world=generateWorld('phase-five-injection');
 const [home,target]=world.bodies.filter(b=>b.kind==='planet');
 const vehicle={...designVehicle(gravityForRadius(home.radius),4,3000,.5),ispS:1e7};
 const manifest=prepareInterplanetaryMission(world,home.id,target.id,1e6,5e6,vehicle)!;
 it('emits identical milestones for one warp or partitioned advancement',()=>{
  const initial=createMissionTimeline('probe-1',manifest);
  const full=advanceMissionTimeline(initial,5e6);
  let cursor=initial;
  const events:typeof manifest.milestones[number][]=[];
  for(const t of [1e6,2e6,3e6,4e6,5e6]){
   const step=advanceMissionTimeline(cursor,t);
   events.push(...step.emitted);
   cursor=step.timeline;
  }
  expect(events).toEqual(full.emitted);
  expect(cursor).toEqual(full.timeline);
  expect(full.emitted).toEqual(manifest.milestones);
  expect(advanceMissionTimeline(cursor,6e6).emitted).toEqual([]);
 });
 it('survives serialization without duplicating the correction or encounter',()=>{
  const initial=createMissionTimeline('probe-2',manifest);
  expect(parseMissionTimeline(JSON.stringify(initial))).toEqual(initial);
  const partial=advanceMissionTimeline(initial,3e6);
  const restored=parseMissionTimeline(JSON.stringify(partial.timeline));
  const remainder=advanceMissionTimeline(restored,5e6);
  expect([...partial.emitted,...remainder.emitted]).toEqual(manifest.milestones);
  expect(()=>parseMissionTimeline(JSON.stringify({...restored,cursor:999}))).toThrow();
  expect(()=>advanceMissionTimeline(restored,1e6)).toThrow();
 });
});

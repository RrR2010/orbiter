import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {prepareInterplanetaryMission} from '../src/simulation/interplanetary-mission-manifest';
import {createMissionTimeline,advanceMissionTimeline} from '../src/simulation/interplanetary-mission-timeline';
import {interplanetaryMissionView} from '../src/simulation/interplanetary-mission-view';

describe('interplanetary mission observability by committed milestone',()=>{
 const world=generateWorld('phase-five-injection');
 const [home,target]=world.bodies.filter(body=>body.kind==='planet');
 const vehicle={...designVehicle(gravityForRadius(home.radius),4,3000,.5),ispS:1e7};
 const manifest=prepareInterplanetaryMission(world,home.id,target.id,1e6,5e6,vehicle)!;
 it('hides future encounter outcome until the actual approach event',()=>{
  let timeline=createMissionTimeline('probe-1',manifest);
  expect(interplanetaryMissionView(timeline).phase).toBe('scheduled');
  expect(interplanetaryMissionView(timeline).outcome).toBe('pending');
  timeline=advanceMissionTimeline(timeline,1e6).timeline;
  expect(interplanetaryMissionView(timeline).phase).toBe('coasting');
  const correction=manifest.milestones.find(m=>m.kind==='course-correction')!;
  timeline=advanceMissionTimeline(timeline,correction.timeS).timeline;
  expect(interplanetaryMissionView(timeline).phase).toBe('corrected');
  expect(interplanetaryMissionView(timeline).outcome).toBe('pending');
  expect(interplanetaryMissionView(timeline).fuelRemainingKg).toBeCloseTo(manifest.remainingFuelKg,8);
  const encounter=manifest.milestones.find(m=>m.kind==='closest-approach')!;
  timeline=advanceMissionTimeline(timeline,encounter.timeS).timeline;
  expect(interplanetaryMissionView(timeline).outcome).toBe('flyby');
  expect(interplanetaryMissionView(advanceMissionTimeline(timeline,5e6).timeline).phase).toBe('complete');
 });
 it('does not confuse unprocessed future results with completed missions',()=>{
  const initial=createMissionTimeline('probe-2',manifest);
  const view=interplanetaryMissionView(initial);
  expect(view.remainingMilestones).toBe(manifest.milestones.length);
  expect(view.correctionDeltaVMs).toBe(0);
  expect(view.lastEventS).toBeNull();
 });
});

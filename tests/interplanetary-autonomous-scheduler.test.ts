import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {advanceCivilization,createCivilization,parseCivilization,serializeCivilization} from '../src/simulation/civilization';

describe('autonomous interplanetary scheduler',()=>{
 const world=generateWorld('phase-five-real-vehicle');
 const ready=()=>{
  const c=createCivilization(world);
  c.stage=4;c.knowledge=3000;c.resources=300;c.nextAt=1;
  return c;
 };
 it('schedules a physically valid probe instead of a local flight',()=>{
  const c=ready();
  advanceCivilization(c,world,1);
  expect(c.interplanetaryTimelines).toHaveLength(1);
  const probe=c.interplanetaryTimelines![0];
  expect(probe.manifest.outcome).toBe('flyby');
  expect(probe.manifest.departureS).toBeGreaterThan(c.time);
  expect(c.resources).toBe(230);
  expect(c.missions).toHaveLength(0);
  expect(c.events.filter(e=>e.missionId===probe.missionId)).toHaveLength(1);
  expect(c.events.at(-1)?.kind).toBe('preparation');
 });
 it('replays milestones identically with warp, partitions and save restoration',()=>{
  const full=ready(),split=ready();
  advanceCivilization(full,world,1);
  advanceCivilization(split,world,1);
  const timeline=full.interplanetaryTimelines![0];
  const end=timeline.manifest.arrivalS;
  advanceCivilization(full,world,end,10000);
  const midway=timeline.manifest.milestones.find(m=>m.kind==='course-correction')!.timeS;
  advanceCivilization(split,world,midway,10000);
  const restored=parseCivilization(serializeCivilization(split),world,midway);
  advanceCivilization(restored,world,end,10000);
  expect(restored.interplanetaryTimelines).toEqual(full.interplanetaryTimelines);
  expect(restored.events).toEqual(full.events);
  expect(restored.resources).toEqual(full.resources);
  expect(restored.missionSerial).toEqual(full.missionSerial);
  expect(restored.interplanetaryTimelines![0].cursor).toBe(timeline.manifest.milestones.length);
 });
});

import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization,advanceCivilization} from '../src/simulation/civilization';
import {poweredTrack,shouldDrawMissionTrail} from '../src/rendering/mission-trajectory';

describe('local mission visualization',()=>{
 it('uses an immutable, cached physical ascent path',()=>{
  const world=generateWorld('visual-trajectory'),c=createCivilization(world);
  advanceCivilization(c,world,350000,10000);
  const mission=c.missions.find(m=>m.flight);
  expect(mission?.flight).toBeDefined();
  if(!mission?.flight)return;
  const before=JSON.stringify(c);
  const a=poweredTrack(mission),b=poweredTrack(mission);
  expect(a.length).toBeGreaterThan(1);
  expect(a).toEqual(b);
  expect(poweredTrack(mission,mission.flight.plan.ignitionS)).toHaveLength(1);
  expect(poweredTrack(mission,mission.flight.terminal.timeS+1000).length).toBeLessThanOrEqual(mission.flight.checkpoints.length);
  expect(shouldDrawMissionTrail(mission,mission.flight.plan.ignitionS+20)).toBe(true);
  const partial={...mission,status:'success' as const,flight:{...mission.flight,orbital:false}};
  expect(shouldDrawMissionTrail(partial,mission.flight.terminal.timeS+1)).toBe(false);
  const orbiter={...mission,status:'success' as const,flight:{...mission.flight,orbital:true}};
  expect(shouldDrawMissionTrail(orbiter,mission.flight.terminal.timeS+1)).toBe(true);
  const crashed={...mission,flight:{...mission.flight,checkpoints:[...mission.flight.checkpoints,{timeS:mission.flight.terminal.timeS+1,state:mission.flight.terminal,kind:'impact' as const,reason:'impact'}]}};
  expect(shouldDrawMissionTrail(crashed,mission.flight.terminal.timeS+2)).toBe(false);
  const early=poweredTrack(mission,mission.flight.plan.ignitionS+20);
  expect(early.length).toBeLessThanOrEqual(a.length);
  expect(a.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))).toBe(true);
  expect(JSON.stringify(c)).toBe(before);
 });
});

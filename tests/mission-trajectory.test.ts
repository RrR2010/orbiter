import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization,advanceCivilization} from '../src/simulation/civilization';
import {poweredTrack} from '../src/rendering/mission-trajectory';

describe('local mission visualization',()=>{
 it('uses an immutable, cached physical ascent path',()=>{
  const world=generateWorld('visual-trajectory'),c=createCivilization(world);
  advanceCivilization(c,world,350000,10000);
  const mission=c.missions.find(m=>m.flight);
  expect(mission?.flight).toBeDefined();
  if(!mission?.flight)return;
  const planet=world.bodies.find(b=>b.id===mission.originId)!;
  const before=JSON.stringify(c);
  const a=poweredTrack(mission,planet.radius),b=poweredTrack(mission,planet.radius);
  expect(a.length).toBeGreaterThan(1);
  expect(a).toBe(b);
  expect(a.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))).toBe(true);
  expect(JSON.stringify(c)).toBe(before);
 });
});

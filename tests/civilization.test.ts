import {describe,it,expect} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization,advanceCivilization,parseCivilization,serializeCivilization,technology} from '../src/simulation/civilization';
describe('autonomous space age',()=>{
 const world=generateWorld('space-age-regression');
 it('assigns one deterministic homeworld without modifying generated orbits',()=>{
  const initial=JSON.stringify(world);
  expect(createCivilization(world)).toEqual(createCivilization(world));
  expect(JSON.stringify(world)).toBe(initial);
 });
 it('unlocks prerequisites and reaches orbital missions',()=>{
  const c=createCivilization(world);
  advanceCivilization(c,world,3e6,10000);
  expect(technology(c)).toEqual(['astronomy','rocketry','orbitalFlight','satellites']);
  expect(c.missionSerial).toBeGreaterThan(0);
  expect(c.successes+c.failures).toBeGreaterThan(0);
 });
 it('is partition-independent, including capped event processing',()=>{
  const whole=createCivilization(world),chunks=createCivilization(world),capped=createCivilization(world);
  advanceCivilization(whole,world,2e6,10000);
  for(let t=10000;t<=2e6;t+=10000)advanceCivilization(chunks,world,t);
  while(capped.time<2e6)advanceCivilization(capped,world,2e6,1);
  expect(chunks).toEqual(whole);expect(capped).toEqual(whole);
 });
 it('resumes without duplicate missions or changed results',()=>{
  const c=createCivilization(world);advanceCivilization(c,world,2e6,10000);
  const restored=parseCivilization(serializeCivilization(c),world,c.time);
  expect(restored).toEqual(c);
  advanceCivilization(c,world,4e6,10000);advanceCivilization(restored,world,4e6,10000);
  expect(restored).toEqual(c);
 });
 it('keeps a bounded history over long simulations',()=>{
  const c=createCivilization(world);
  advanceCivilization(c,world,1e8,100000);
  expect(c.events.length).toBeLessThanOrEqual(120);
  expect(c.missions.length).toBeLessThanOrEqual(60);
  expect(c.successes+c.failures).toBeGreaterThan(100);
 });
 it('rejects unrelated universes and keeps event identities unique',()=>{
  const c=createCivilization(world);advanceCivilization(c,world,8e6,10000);
  expect(new Set(c.events.map(e=>e.id)).size).toBe(c.events.length);
  const foreign=generateWorld('another universe');
  const migrated=parseCivilization(serializeCivilization(c),foreign,c.time);
  expect(migrated.seed).toBe(foreign.seed);expect(migrated.events).toEqual([]);
 });
 it('finds both successful and unsuccessful missions without frame-driven RNG',()=>{
  const c=createCivilization(world);advanceCivilization(c,world,8e6,10000);
  expect(c.missions.some(m=>m.status==='success')).toBe(true);
  expect(c.missions.some(m=>m.status==='failure')).toBe(true);
 });
 it('migrates missing strategic saves at current time without inventing past events',()=>{
  const c=parseCivilization(null,world,1234567);
  expect(c.time).toBe(1234567);expect(c.events).toEqual([]);expect(c.missions).toEqual([]);
 });
});

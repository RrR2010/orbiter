import {describe,it,expect} from 'vitest';
import {flightAt} from '../src/simulation/spaceflight/flight';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {flightSucceeded} from '../src/simulation/spaceflight/flight';
import {generateWorld} from '../src/simulation/world';
import {createCivilization,advanceCivilization,parseCivilization,serializeCivilization,technology,RESOURCE_CAP,RESOURCE_INCOME_PER_DAY,LAUNCH_RESOURCE_COST} from '../src/simulation/civilization';
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
 it('does not skip events under a limited processing budget',()=>{
  const limited=createCivilization(world),reference=createCivilization(world);
  const target=3e6;
  advanceCivilization(reference,world,target,10000);
  let passes=0;
  while(limited.time<target&&passes++<10000)advanceCivilization(limited,world,target,2);
  expect(passes).toBeLessThan(10000);
  expect(limited).toEqual(reference);
  const snapshot=serializeCivilization(limited);
  expect(advanceCivilization(limited,world,target,2)).toBe(0);
  expect(serializeCivilization(limited)).toBe(snapshot);
 });
 it('records simulated flight plans without rewriting already settled missions',()=>{
  const c=createCivilization(world);
  advanceCivilization(c,world,3e6,10000);
  const flown=c.missions.filter(m=>m.flight);
  expect(flown.length).toBeGreaterThan(0);
  for(const mission of flown){
   const origin=world.bodies.find(b=>b.id===mission.originId)!;
   const physics=gravityForRadius(origin.radius);
   const snapshot=flightAt(mission.flight!,physics,mission.resolvedAt||c.time);
   if(mission.status==='success'||mission.status==='failure')expect(mission.success).toBe(flightSucceeded(snapshot,physics));
  }
  const original=structuredClone(c);
  const restored=parseCivilization(serializeCivilization(c),world,c.time);
  expect(restored).toEqual(original);
 });
 it('spends resources and replenishes them slowly enough to observe launch costs',()=>{
  const c=createCivilization(world);
  advanceCivilization(c,world,100000,10000);
  expect(c.resources).toBeLessThanOrEqual(RESOURCE_CAP);
  expect(RESOURCE_INCOME_PER_DAY*2).toBeLessThan(LAUNCH_RESOURCE_COST);
  const before=c.resources;
  const next=c.nextAt;
  advanceCivilization(c,world,next,10000);
  expect(c.resources).toBeLessThanOrEqual(RESOURCE_CAP);
  expect(Number.isFinite(c.resources)).toBe(true);
  expect(before).toBeGreaterThanOrEqual(0);
  const restored=parseCivilization(serializeCivilization(c),world,c.time);
  expect(restored.resources).toBe(c.resources);
 });
 it('migrates missing strategic saves at current time without inventing past events',()=>{
  const c=parseCivilization(null,world,1234567);
  expect(c.time).toBe(1234567);expect(c.events).toEqual([]);expect(c.missions).toEqual([]);
 });
});

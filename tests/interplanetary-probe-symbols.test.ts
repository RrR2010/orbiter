import {positionsAt} from '../src/simulation/world';
import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {advanceCivilization,createCivilization,parseCivilization,serializeCivilization} from '../src/simulation/civilization';
import {interplanetaryProbeSymbols} from '../src/rendering/interplanetary-probe-symbols';

describe('physical probe observatory projection',()=>{
 const world=generateWorld('phase-five-real-vehicle');
 const start=()=>{
  const c=createCivilization(world);
  c.stage=4;c.knowledge=3000;c.resources=300;c.nextAt=1;
  c.missions.push({id:'completed-local-flight',originId:c.homeId,targetId:c.homeId,
   startedAt:0,launchAt:0,resolvedAt:0,status:'success',success:true,vehicleId:'historical-local'});
  advanceCivilization(c,world,1);
  return c;
 };
 it('does not display an unlaunched probe or fabricate pre-correction positions',()=>{
  const c=start(),manifest=c.interplanetaryTimelines![0].manifest;
  expect(interplanetaryProbeSymbols(c,1)).toEqual([]);
  advanceCivilization(c,world,manifest.correctedCoastStart.timeS,10000);
  const symbols=interplanetaryProbeSymbols(c,c.time);
  expect(symbols).toHaveLength(1);
  expect(symbols[0].position).toEqual(manifest.correctedCoastStart.position);
  expect(symbols[0].state.fuelKg).toBeCloseTo(manifest.remainingFuelKg,6);
 });
 it('shows only physically modeled pre-correction solar coast',()=>{
  const c=start(),manifest=c.interplanetaryTimelines![0].manifest;
  const escape=manifest.preCorrectionCoastStart!;
  expect(escape.timeS).toBeGreaterThan(manifest.departureS);
  advanceCivilization(c,world,escape.timeS-1,10000);
  expect(interplanetaryProbeSymbols(c,c.time)).toEqual([]);
  advanceCivilization(c,world,escape.timeS,10000);
  const symbol=interplanetaryProbeSymbols(c,c.time)[0];
  expect(symbol.phase).toBe('coasting');
  expect(symbol.position).toEqual(escape.position);
  expect(symbol.state.fuelKg).toBeCloseTo(escape.fuelKg,6);
 });
 it('projects the actual planetary escape after departure with world ephemerides',()=>{
  const c=start(),manifest=c.interplanetaryTimelines![0].manifest;
  const launch=manifest.planetaryEscapeStart!;
  expect(launch.timeS).toBe(manifest.departureS);
  advanceCivilization(c,world,launch.timeS,10000);
  const before=serializeCivilization(c);
  const projected=interplanetaryProbeSymbols(c,launch.timeS,world);
  expect(projected).toHaveLength(1);
  const home=world.bodies.find(body=>body.id===manifest.originId)!;
  const center=positionsAt(world,launch.timeS).get(home.id)!;
  expect(projected[0].position.x-center.x).toBeCloseTo(launch.position.x,4);
  expect(projected[0].position.y-center.y).toBeCloseTo(launch.position.y,4);
  const midpoint=(launch.timeS+manifest.preCorrectionCoastStart!.timeS)/2;
  advanceCivilization(c,world,midpoint,10000);
  const middle=interplanetaryProbeSymbols(c,midpoint,world);
  expect(middle).toHaveLength(1);
  expect(Number.isFinite(middle[0].position.x)).toBe(true);
  expect(serializeCivilization(c)).not.toBe(before);
  expect(interplanetaryProbeSymbols(c,midpoint,world)).toEqual(middle);
 });
 it('preserves position, velocity and fuel across the SOI frame handoff',()=>{
  const c=start(),manifest=c.interplanetaryTimelines![0].manifest;
  const boundary=manifest.preCorrectionCoastStart!;
  const epsilon=Math.min(0.01,(boundary.timeS-manifest.departureS)/1000);
  advanceCivilization(c,world,boundary.timeS,10000);
  const before=interplanetaryProbeSymbols(c,boundary.timeS-epsilon,world)[0];
  const at=interplanetaryProbeSymbols(c,boundary.timeS,world)[0];
  expect(before).toBeDefined();
  expect(at).toBeDefined();
  // Small temporal separation should not introduce a coordinate jump at SOI.
  expect(Math.hypot(before.position.x-at.position.x,before.position.y-at.position.y))
   .toBeLessThan(Math.hypot(at.state.velocity.x,at.state.velocity.y)*epsilon*10+100);
  expect(Math.hypot(before.state.velocity.x-at.state.velocity.x,
   before.state.velocity.y-at.state.velocity.y)).toBeLessThan(10);
  expect(before.state.fuelKg).toBeCloseTo(at.state.fuelKg,6);
  expect(at.position).toEqual(boundary.position);
  expect(at.state.timeS).toBe(boundary.timeS);
 });
 it('replays escape and correction samples after save/load without mutation',()=>{
  const c=start(),manifest=c.interplanetaryTimelines![0].manifest;
  const times=[
   (manifest.departureS+manifest.preCorrectionCoastStart!.timeS)/2,
   (manifest.preCorrectionCoastStart!.timeS+manifest.correctedCoastStart.timeS)/2,
   manifest.correctedCoastStart.timeS,
   manifest.correctedCoastStart.timeS+3600
  ];
  for(const time of times){
   advanceCivilization(c,world,time,10000);
   const snapshot=serializeCivilization(c);
   const expected=interplanetaryProbeSymbols(c,time,world);
   const restored=parseCivilization(snapshot,world,time);
   expect(interplanetaryProbeSymbols(restored,time,world)).toEqual(expected);
   expect(serializeCivilization(c)).toBe(snapshot);
   expect(expected).toHaveLength(1);
  }
 });
 it('keeps a post-flyby probe observable without teleporting it home',()=>{
  const c=start(),manifest=c.interplanetaryTimelines![0].manifest;
  const later=manifest.arrivalS+7*86400;
  advanceCivilization(c,world,later,10000);
  const before=serializeCivilization(c);
  const visible=interplanetaryProbeSymbols(c,later,world);
  expect(visible).toHaveLength(1);
  expect(visible[0].phase).toBe('complete');
  expect(visible[0].state.timeS).toBe(later);
  const atArrival=interplanetaryProbeSymbols(c,manifest.arrivalS,world)[0];
  expect(visible[0].position).not.toEqual(atArrival.position);
  const restored=parseCivilization(before,world,later);
  expect(interplanetaryProbeSymbols(restored,later,world)).toEqual(visible);
  expect(serializeCivilization(c)).toBe(before);
 });
 it('projects immutable, deterministic solar states after save/load',()=>{
  const c=start(),manifest=c.interplanetaryTimelines![0].manifest;
  const time=manifest.correctedCoastStart.timeS+3600;
  advanceCivilization(c,world,time,10000);
  const before=serializeCivilization(c);
  const original=interplanetaryProbeSymbols(c,time);
  const restored=parseCivilization(before,world,time);
  expect(interplanetaryProbeSymbols(restored,time)).toEqual(original);
  expect(interplanetaryProbeSymbols(c,time)).toEqual(original);
  expect(serializeCivilization(c)).toBe(before);
  expect(original[0].state.timeS).toBe(time);
  expect(Number.isFinite(original[0].position.x)).toBe(true);
 });
});

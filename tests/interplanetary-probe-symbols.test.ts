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

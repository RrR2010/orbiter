import {describe,expect,it} from 'vitest';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {executeGuidanceV2} from '../src/simulation/spaceflight/executor-v2';
import {analyzeTrajectory} from '../src/simulation/spaceflight/conics';
import type {FlightState} from '../src/simulation/spaceflight/types';
const planet=gravityForRadius(6371000),r=planet.radiusM+400000,mu=planet.muM3S2;
const state:FlightState={position:{x:r,y:0},velocity:{x:0,y:Math.sqrt(mu/r)*.8},massKg:1000,fuelKg:350,timeS:0};
const goal={periapsisAltitudeM:300000,apoapsisAltitudeM:400000,toleranceM:20000};
const engine={thrustN:35000,ispS:400,stepS:1};
describe('event-based flight executor v2',()=>{
 it('produces reproducible checkpoint boundaries and consumes fuel',()=>{
  const a=executeGuidanceV2(state,planet,goal,engine);
  expect(a).toEqual(executeGuidanceV2(state,planet,goal,engine));
  expect(a.checkpoints.length).toBeGreaterThanOrEqual(2);
  expect(a.end.fuelKg).toBeLessThan(state.fuelKg);
  expect(a.end.timeS).toBeGreaterThan(state.timeS);
  expect(a.checkpoints.some(c=>c.kind==='burn-end')).toBe(true);
  expect(analyzeTrajectory(a.end,planet).periapsisM).toBeGreaterThan(0);
 });
 it('honors fuel exhaustion and does not invent impulse',()=>{
  const empty={...state,fuelKg:0};
  const result=executeGuidanceV2(empty,planet,goal,engine);
  expect(result.end).toEqual(empty);
  expect(result.checkpoints.every(c=>c.kind!=='burn-end')).toBe(true);
 });
 it('has no renderer, camera or warp dependency',()=>{
  const output=JSON.stringify(executeGuidanceV2(state,planet,goal,engine));
  expect(output).toBe(JSON.stringify(executeGuidanceV2(structuredClone(state),structuredClone(planet),structuredClone(goal),structuredClone(engine))));
 });
});

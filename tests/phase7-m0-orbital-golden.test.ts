import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {analyzeTrajectory} from '../src/simulation/spaceflight/conics';
import {createAutonomousFlightV2,resolveAutonomousFlightV2} from '../src/simulation/spaceflight/flight-v2';
import {fromLocalFlight,solarFrame,transformState,bodyFrame} from '../src/simulation/reference-frames';

/** Recorded from the preexisting physical flight engine, not a constructed circular state. */
describe('phase 7 numerical golden: achieved orbital insertion',()=>{
 it('reproduces a successful powered insertion and preserves its physical state across frames',()=>{
  const world=generateWorld('phase-five-injection');
  const planet=world.bodies.find(body=>body.kind==='planet')!;
  const plan=createAutonomousFlightV2(world.seed,'phase7-discovery-1',planet,100,4);
  const result=resolveAutonomousFlightV2(plan,gravityForRadius(planet.radius));
  expect(result.outcome).toBe('achieved');
  expect(result.orbital).toBe(true);
  expect(result.goalAchieved).toBe(true);
  expect(result.terminal.fuelKg).toBeCloseTo(472.93820321595604,5);
  expect(result.terminal.timeS).toBeCloseTo(2705.2783419502125,5);
  expect(result.terminal.massKg).toBeGreaterThan(result.terminal.fuelKg);
  expect(result.terminal.fuelKg).toBeGreaterThanOrEqual(0);
  const orbit=analyzeTrajectory(result.terminal,gravityForRadius(planet.radius));
  expect(orbit.kind).toBe('elliptic');
  expect(orbit.surfaceIntersecting).toBe(false);
  const state=fromLocalFlight(plan.id,planet.id,result.terminal);
  const restored=transformState(world,transformState(world,state,solarFrame),bodyFrame(planet.id));
  expect(Math.abs(restored.positionM.x-state.positionM.x)).toBeLessThan(1e-4);
  expect(Math.abs(restored.positionM.y-state.positionM.y)).toBeLessThan(1e-4);
  expect(Math.abs(restored.velocityMs.x-state.velocityMs.x)).toBeLessThan(1e-7);
  expect(Math.abs(restored.velocityMs.y-state.velocityMs.y)).toBeLessThan(1e-7);
  expect(restored.epochS).toBe(state.epochS);
  expect(restored.massKg).toBe(state.massKg);
  expect(restored.fuelKg).toBe(state.fuelKg);
 });
 it('reproduces a successful nonorbital objective without misclassifying it as insertion',()=>{
  const world=generateWorld('phase-five-injection');
  const planet=world.bodies.find(body=>body.kind==='planet')!;
  const result=resolveAutonomousFlightV2(
   createAutonomousFlightV2(world.seed,'phase7-discovery-11',planet,100,4),
   gravityForRadius(planet.radius));
  expect(result.outcome).toBe('achieved');
  expect(result.goalAchieved).toBe(true);
  expect(result.orbital).toBe(false);
  expect(result.terminal.fuelKg).toBeCloseTo(760.8731029769342,5);
  expect(result.terminal.timeS).toBeCloseTo(973.7292176692088,5);
 });
});

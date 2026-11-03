import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {simulateLambertPhysicalTransfer} from '../src/simulation/interplanetary-lambert-physical-transfer';
import {assessPlanetaryApproach} from '../src/simulation/interplanetary-approach';
import {bodyFrame,fromHeliocentricProbe,solarFrame,transformState} from '../src/simulation/reference-frames';

/** Golden values observed from a real, uncorrected physical Lambert transfer. */
describe('phase 7 numerical golden: positive planetary flyby',()=>{
 it('reproduces a real positive-altitude flyby after escape, SOI handoff and solar coast',()=>{
  const world=generateWorld('phase-five-injection');
  const [origin,target]=world.bodies.filter(body=>body.kind==='planet');
  const standard=designVehicle(gravityForRadius(origin.radius),4,3000,.5);
  const vehicle={...standard,ispS:1e7};
  const run=()=>simulateLambertPhysicalTransfer(world,origin.id,target.id,500000,2500000,vehicle);
  const result=run();
  expect(result).not.toBeNull();
  if(!result)throw new Error('Expected a physical flyby transfer');
  expect(result).toEqual(run());
  expect(result.closestDistanceM).toBeCloseTo(85800547.14968894,2);
  expect(result.closestAltitudeM).toBeCloseTo(73084420.15089561,2);
  expect(result.closestAltitudeM).toBeGreaterThan(0);
  expect(result.closestDistanceM).toBeLessThanOrEqual(target.radius*10);
  expect(result.closestTimeS).toBeGreaterThanOrEqual(result.escape.escape.heliocentric.timeS);
  expect(result.closestTimeS).toBeLessThanOrEqual(result.arrival.timeS);
  const assessment=assessPlanetaryApproach({
   closestDistanceM:result.closestDistanceM,
   closestAltitudeM:result.closestAltitudeM,
   closestRelativeSpeedMs:2500,
  } as Parameters<typeof assessPlanetaryApproach>[0],target);
  expect(assessment.outcome).toBe('flyby');
  const handoff=result.escape.escape.heliocentric;
  const state=fromHeliocentricProbe('phase7-flyby',handoff);
  const restored=transformState(world,transformState(world,state,bodyFrame(origin.id)),solarFrame);
  expect(Math.abs(restored.positionM.x-state.positionM.x)).toBeLessThan(1e-4);
  expect(Math.abs(restored.positionM.y-state.positionM.y)).toBeLessThan(1e-4);
  expect(Math.abs(restored.velocityMs.x-state.velocityMs.x)).toBeLessThan(1e-7);
  expect(Math.abs(restored.velocityMs.y-state.velocityMs.y)).toBeLessThan(1e-7);
  expect(restored.massKg).toBe(state.massKg);
  expect(restored.fuelKg).toBe(state.fuelKg);
 });
});

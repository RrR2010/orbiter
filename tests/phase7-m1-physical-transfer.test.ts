import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {simulateLambertPhysicalTransfer} from '../src/simulation/interplanetary-lambert-physical-transfer';
import {assessPlanetaryApproach} from '../src/simulation/interplanetary-approach';
import {bodyFrame,fromHeliocentricProbe,solarFrame,transformState} from '../src/simulation/reference-frames';

/** Real escape -> SOI -> heliocentric coast -> encounter assessment, with no fabricated flyby. */
describe('phase 7 physical transfer frame regression',()=>{
 it('preserves the actual SOI state and classifies the propagated closest approach',()=>{
  const world=generateWorld('phase-five-injection');
  const [origin,target]=world.bodies.filter(body=>body.kind==='planet');
  const standard=designVehicle(gravityForRadius(origin.radius),4,3000,.5);
  const vehicle={...standard,ispS:1e7};
  const run=()=>simulateLambertPhysicalTransfer(world,origin.id,target.id,1e6,5e6,vehicle);
  const result=run();
  expect(result).not.toBeNull();
  if(!result)throw new Error('Expected physical transfer');
  expect(run()).toEqual(result);
  const handoff=result.escape.escape.heliocentric;
  const heliocentric=fromHeliocentricProbe('physical-probe',handoff);
  const local=transformState(world,heliocentric,bodyFrame(origin.id));
  const restored=transformState(world,local,solarFrame);
  expect(Math.abs(restored.positionM.x-handoff.position.x)).toBeLessThanOrEqual(1e-4);
  expect(Math.abs(restored.positionM.y-handoff.position.y)).toBeLessThanOrEqual(1e-4);
  expect(Math.abs(restored.velocityMs.x-handoff.velocity.x)).toBeLessThanOrEqual(1e-7);
  expect(Math.abs(restored.velocityMs.y-handoff.velocity.y)).toBeLessThanOrEqual(1e-7);
  expect(restored.massKg).toBe(handoff.massKg);
  expect(restored.fuelKg).toBe(handoff.fuelKg);
  expect(restored.epochS).toBe(handoff.timeS);
  const geometry={...result,closestRelativeSpeedMs:2500};
  const assessment=assessPlanetaryApproach(geometry,target);
  const expected=result.closestAltitudeM<=0?'impact-risk':
   result.closestDistanceM<=target.radius*10?'flyby':'distant-miss';
  expect(assessment.outcome).toBe(expected);
  expect(assessment.closestDistanceM).toBe(result.closestDistanceM);
  expect(result.closestTimeS).toBeGreaterThanOrEqual(handoff.timeS);
  expect(result.closestTimeS).toBeLessThanOrEqual(result.arrival.timeS);
 });
});

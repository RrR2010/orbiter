import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {simulateLambertPhysicalTransfer} from '../src/simulation/interplanetary-lambert-physical-transfer';
import {orbitalPosition} from '../src/simulation/orbits';

describe('physical Lambert transfer after SOI handoff',()=>{
 const world=generateWorld('phase-five-injection');
 const [home,target]=world.bodies.filter(body=>body.kind==='planet');
 const standard=designVehicle(gravityForRadius(home.radius),4,3000,.5);
 const vehicle={...standard,ispS:1e7};
 it('measures actual miss without overriding the true coast state',()=>{
  const result=simulateLambertPhysicalTransfer(world,home.id,target.id,1e6,5e6,vehicle)!;
  expect(result).not.toBeNull();
  expect(result.escape.escape.heliocentric.timeS).toBeLessThan(5e6);
  expect(result.arrival.timeS).toBe(5e6);
  const atTarget=orbitalPosition(target.orbit!,5e6);
  const miss=Math.hypot(result.arrival.position.x-atTarget.x,result.arrival.position.y-atTarget.y);
  expect(result.arrivalMissM).toBeCloseTo(miss,6);
  expect(result.closestDistanceM).toBeLessThanOrEqual(result.arrivalMissM);
  expect(result.closestAltitudeM).toBeCloseTo(result.closestDistanceM-target.radius,4);
  expect(result).toEqual(simulateLambertPhysicalTransfer(world,home.id,target.id,1e6,5e6,vehicle));
 });
 it('does not conjure a mission without sufficient propellant',()=>{
  expect(simulateLambertPhysicalTransfer(world,home.id,target.id,1e6,5e6,
   {...standard,fuelKg:0})).toBeNull();
 });
});

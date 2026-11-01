import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planLambertDeparture} from '../src/simulation/interplanetary-lambert-departure';
import {planetaryVelocityAt} from '../src/simulation/interplanetary-handoff';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {propagateCoast} from '../src/simulation/spaceflight/coast';
import {orbitalPosition} from '../src/simulation/orbits';

describe('Lambert departure velocity and propellant budget',()=>{
 const world=generateWorld('phase-five-injection');
 const [origin,target]=world.bodies.filter(body=>body.kind==='planet');
 const departureS=1e6,arrivalS=departureS+4e6;
 const vehicle=designVehicle(gravityForRadius(origin.radius),4,3000,.5);
 it('maps heliocentric velocity onto physical excess velocity and fuel',()=>{
  const plan=planLambertDeparture(world,origin.id,target.id,departureS,arrivalS,vehicle)!;
  expect(plan).not.toBeNull();
  const planetV=planetaryVelocityAt(origin,departureS);
  expect(plan.excessVelocity.x+planetV.x).toBeCloseTo(plan.transfer.departureVelocity.x,6);
  expect(plan.excessVelocity.y+planetV.y).toBeCloseTo(plan.transfer.departureVelocity.y,6);
  expect(plan.c3M2S2).toBeCloseTo(plan.excessSpeedMs**2,6);
  expect(plan.injectionSpeedMs).toBeGreaterThan(plan.parkingSpeedMs);
  expect(plan.requiredFuelKg).toBeGreaterThan(0);
  expect(plan.feasible).toBe(plan.requiredFuelKg<=vehicle.fuelKg);
  const arrival=propagateCoast({
   position:orbitalPosition(origin.orbit!,departureS),
   velocity:plan.transfer.departureVelocity,timeS:departureS,massKg:100,fuelKg:0,
  },{radiusM:1,muM3S2:1.32712440018e20},arrivalS-departureS);
  const expected=orbitalPosition(target.orbit!,arrivalS);
  expect(Math.hypot(arrival.position.x-expected.x,arrival.position.y-expected.y)).toBeLessThan(10000);
 });
 it('rejects invalid geometry and reports impossible propellant budget honestly',()=>{
  expect(planLambertDeparture(world,origin.id,origin.id,departureS,arrivalS,vehicle)).toBeNull();
  expect(()=>planLambertDeparture(world,origin.id,target.id,arrivalS,departureS,vehicle)).toThrow();
  const empty=planLambertDeparture(world,origin.id,target.id,departureS,arrivalS,{...vehicle,fuelKg:0})!;
  expect(empty.feasible).toBe(false);
  expect(empty.requiredFuelKg).toBeGreaterThan(0);
 });
});

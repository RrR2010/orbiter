import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planTransferOpportunity} from '../src/simulation/interplanetary-planner';
import {simulateContinuousTransfer} from '../src/simulation/interplanetary-continuous-transfer';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

describe('continuous escape and solar coasting',()=>{
 const world=generateWorld('phase-five-injection');
 const planets=world.bodies.filter(body=>body.kind==='planet');
 const home=planets[0],target=planets[1];
 const plan=planTransferOpportunity(world,home.id,target.id,1e6)!;
 const vehicle=designVehicle(gravityForRadius(home.radius),4,3000,.5);
 it('preserves mass, fuel and absolute time across the escape-to-solar handoff',()=>{
  const result=simulateContinuousTransfer(world,plan,vehicle);
  expect(result).not.toBeNull();
  expect(result!.escape.localAtBoundary.timeS).toBe(result!.escape.heliocentric.timeS);
  expect(result!.escape.localAtBoundary.massKg).toBe(result!.escape.heliocentric.massKg);
  expect(result!.arrival.fuelKg).toBe(result!.escape.heliocentric.fuelKg);
  expect(result!.arrival.massKg).toBe(result!.escape.heliocentric.massKg);
  expect(result!.arrival.timeS).toBe(plan.arrivalS);
  expect(result!.closestDistanceM).toBeGreaterThanOrEqual(0);
  expect(result!.closestTimeS).toBeGreaterThanOrEqual(result!.escape.heliocentric.timeS);
  expect(result!.closestTimeS).toBeLessThanOrEqual(plan.arrivalS);
  expect(result!.closestDistanceM).toBeLessThanOrEqual(result!.arrivalDistanceM);
  expect(Number.isFinite(result!.arrivalDistanceM)).toBe(true);
  expect(result).toEqual(simulateContinuousTransfer(world,plan,vehicle));
 });
 it('does not transfer without adequate injection propellant',()=>{
  expect(simulateContinuousTransfer(world,plan,{...vehicle,fuelKg:0})).toBeNull();
 });
});

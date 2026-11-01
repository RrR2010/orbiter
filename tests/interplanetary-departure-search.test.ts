import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planTransferOpportunity} from '../src/simulation/interplanetary-planner';
import {searchInterplanetaryDeparture} from '../src/simulation/interplanetary-departure-search';
import {simulateContinuousTransfer} from '../src/simulation/interplanetary-continuous-transfer';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

describe('bounded launch epoch and injection search',()=>{
 const world=generateWorld('phase-five-injection');
 const [home,target]=world.bodies.filter(body=>body.kind==='planet');
 const plan=planTransferOpportunity(world,home.id,target.id,1e6)!;
 const vehicle=designVehicle(gravityForRadius(home.radius),4,3000,.5);
 it('evaluates real coasts at different epochs without inventing arrival',()=>{
  const result=searchInterplanetaryDeparture(world,plan,vehicle,86400,2,2);
  expect(result).not.toBeNull();
  expect(result!.attempted).toBe(9);
  expect(result!.successful).toBeGreaterThan(0);
  expect(result!.successful).toBeLessThanOrEqual(result!.attempted);
  expect(Math.abs(result!.plan.departureS-plan.departureS)).toBeLessThanOrEqual(86400);
  expect(result!.plan.arrivalS-result!.plan.departureS).toBeCloseTo(plan.transferTimeS,6);
  // Floating-point propagation may differ by sub-nanometer rounding.
  expect(result!.transfer.closestDistanceM).toBeCloseTo(
   simulateContinuousTransfer(world,result!.plan,vehicle,result!.angleRad)!.closestDistanceM,6);
  expect(result).toEqual(searchInterplanetaryDeparture(world,plan,vehicle,86400,2,2));
 });
 it('never plans an invalid interval or manufactures fuel',()=>{
  expect(()=>searchInterplanetaryDeparture(world,plan,vehicle,-1)).toThrow();
  expect(()=>searchInterplanetaryDeparture(world,plan,vehicle,1,0)).toThrow();
  expect(()=>searchInterplanetaryDeparture(world,plan,vehicle,1,2,17)).toThrow();
  expect(searchInterplanetaryDeparture(world,plan,{...vehicle,fuelKg:0},86400,2,2)).toBeNull();
 });
});

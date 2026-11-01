import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planTransferOpportunity} from '../src/simulation/interplanetary-planner';
import {searchInterplanetaryAim} from '../src/simulation/interplanetary-aim';
import {simulateContinuousTransfer} from '../src/simulation/interplanetary-continuous-transfer';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

describe('deterministic physically evaluated aiming',()=>{
 const world=generateWorld('phase-five-injection');
 const [home,target]=world.bodies.filter(body=>body.kind==='planet');
 const plan=planTransferOpportunity(world,home.id,target.id,1e6)!;
 const vehicle=designVehicle(gravityForRadius(home.radius),4,3000,.5);
 it('does not claim an encounter without measured physical proximity',()=>{
  const solution=searchInterplanetaryAim(world,plan,vehicle,4);
  expect(solution).not.toBeNull();
  expect(solution!.angleRad).toBeGreaterThanOrEqual(-Math.PI/2);
  expect(solution!.angleRad).toBeLessThanOrEqual(Math.PI/2);
  expect(solution!.attempts).toBe(5);
  expect(Number.isFinite(solution!.transfer.closestDistanceM)).toBe(true);
  const reproduced=simulateContinuousTransfer(world,plan,vehicle,solution!.angleRad);
  expect(reproduced!.closestDistanceM).toBe(solution!.transfer.closestDistanceM);
  expect(searchInterplanetaryAim(world,plan,vehicle,4)).toEqual(solution);
 });
 it('honors resolution bounds and insufficient fuel',()=>{
  expect(()=>searchInterplanetaryAim(world,plan,vehicle,1)).toThrow();
  expect(searchInterplanetaryAim(world,plan,{...vehicle,fuelKg:0},4)).toBeNull();
 });
});

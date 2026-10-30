import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planTransferOpportunity} from '../src/simulation/interplanetary-planner';
import {estimateTransferBudget} from '../src/simulation/interplanetary-budget';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

describe('interplanetary departure budget',()=>{
 const world=generateWorld('phase-five-budget');
 const planets=world.bodies.filter(body=>body.kind==='planet');
 const home=planets[0],target=planets[1];
 const opportunity=planTransferOpportunity(world,home.id,target.id,1e6)!;
 const capability=designVehicle(gravityForRadius(home.radius),4,3000,.5);
 it('computes a nonnegative escape cost with finite deterministic margins',()=>{
  const budget=estimateTransferBudget(home,target,opportunity,capability);
  expect(budget).toEqual(estimateTransferBudget(home,target,opportunity,capability));
  expect(budget.escapeDeltaVMs).toBeGreaterThan(0);
  expect(budget.requiredDeltaVMs).toBeGreaterThan(budget.escapeDeltaVMs);
  expect(Number.isFinite(budget.marginDeltaVMs)).toBe(true);
  expect(budget.feasible).toBe(budget.marginDeltaVMs>=0);
 });
 it('does not authorize a mission without sufficient vehicle delta-v',()=>{
  const poor={...capability,deltaVMs:1};
  const budget=estimateTransferBudget(home,target,opportunity,poor);
  expect(budget.feasible).toBe(false);
  expect(budget.marginDeltaVMs).toBeLessThan(0);
 });
 it('rejects bad endpoints and invalid reserve fractions',()=>{
  expect(()=>estimateTransferBudget(target,home,opportunity,capability)).toThrow();
  expect(()=>estimateTransferBudget(home,target,opportunity,capability,1)).toThrow();
 });
});

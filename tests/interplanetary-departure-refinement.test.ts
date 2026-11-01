import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planTransferOpportunity} from '../src/simulation/interplanetary-planner';
import {searchInterplanetaryDeparture} from '../src/simulation/interplanetary-departure-search';
import {refineInterplanetaryDeparture} from '../src/simulation/interplanetary-departure-refinement';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

describe('joint physical departure refinement',()=>{
 const world=generateWorld('phase-five-injection');
 const [home,target]=world.bodies.filter(b=>b.kind==='planet');
 const plan=planTransferOpportunity(world,home.id,target.id,1e6)!;
 const vehicle=designVehicle(gravityForRadius(home.radius),4,3000,.5);
 it('never worsens a physical coarse solution',()=>{
  const coarse=searchInterplanetaryDeparture(world,plan,vehicle,15*86400,4,4)!;
  const refined=refineInterplanetaryDeparture(world,plan,vehicle,15*86400,3)!;
  expect(refined.solution.transfer.closestDistanceM).toBeLessThanOrEqual(coarse.transfer.closestDistanceM);
  expect(refined.attempted).toBeGreaterThanOrEqual(25);
  expect(refined.attempted).toBeLessThanOrEqual(49);
  expect(refined.viable).toBeGreaterThan(0);
  expect(refined.viable).toBeLessThanOrEqual(refined.attempted);
  expect(refined).toEqual(refineInterplanetaryDeparture(world,plan,vehicle,15*86400,3));
 });
 it('keeps the search bounded and rejects impossible escape',()=>{
  expect(()=>refineInterplanetaryDeparture(world,plan,vehicle,0)).toThrow();
  expect(()=>refineInterplanetaryDeparture(world,plan,vehicle,86400,9)).toThrow();
  expect(refineInterplanetaryDeparture(world,plan,{...vehicle,fuelKg:0},86400,2)).toBeNull();
 });
});

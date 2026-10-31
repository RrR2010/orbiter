import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planTransferOpportunity} from '../src/simulation/interplanetary-planner';
import {diagnoseInterplanetaryTargeting} from '../src/simulation/interplanetary-targeting-diagnostic';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

describe('interplanetary targeting diagnostics',()=>{
 const world=generateWorld('phase-five-injection');
 const [home,target]=world.bodies.filter(b=>b.kind==='planet');
 const plan=planTransferOpportunity(world,home.id,target.id,1e6)!;
 const vehicle=designVehicle(gravityForRadius(home.radius),4,3000,.5);
 it('reports physical approach in target radii with no invented success',()=>{
  const result=diagnoseInterplanetaryTargeting(world,plan,vehicle,86400,2,2);
  expect(result.solution).not.toBeNull();
  expect(result.attempted).toBe(9);
  expect(result.successful).toBeGreaterThan(0);
  expect(result.distanceInTargetRadii).toBeCloseTo(result.closestDistanceM!/target.radius,8);
  expect(result.outcome).toBe(result.closestAltitudeM!<=0?'impact-risk':
   result.distanceInTargetRadii!<=10?'flyby':'distant-miss');
  expect(result).toEqual(diagnoseInterplanetaryTargeting(world,plan,vehicle,86400,2,2));
 });
 it('distinguishes absence of viable escape from a real miss',()=>{
  const result=diagnoseInterplanetaryTargeting(world,plan,{...vehicle,fuelKg:0},86400,2,2);
  expect(result.outcome).toBe('no-escape');
  expect(result.solution).toBeNull();
  expect(result.successful).toBe(0);
 });
});

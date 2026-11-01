import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planTransferOpportunity} from '../src/simulation/interplanetary-planner';
import {refineInterplanetaryAim,searchInterplanetaryAim} from '../src/simulation/interplanetary-aim';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

describe('local injection aim refinement',()=>{
 const world=generateWorld('phase-five-injection');
 const [home,target]=world.bodies.filter(body=>body.kind==='planet');
 const plan=planTransferOpportunity(world,home.id,target.id,1e6)!;
 const vehicle=designVehicle(gravityForRadius(home.radius),4,3000,.5);
 it('never worsens the measured distance and remains reproducible',()=>{
  const coarse=searchInterplanetaryAim(world,plan,vehicle,4)!;
  const refined=refineInterplanetaryAim(world,plan,vehicle,4,4)!;
  expect(refined.attempts).toBe(9);
  expect(refined.transfer.closestDistanceM).toBeLessThanOrEqual(coarse.transfer.closestDistanceM);
  expect(refined).toEqual(refineInterplanetaryAim(world,plan,vehicle,4,4));
 });
 it('rejects excessive refinement and inadequate fuel',()=>{
  expect(()=>refineInterplanetaryAim(world,plan,vehicle,4,0)).toThrow();
  expect(()=>refineInterplanetaryAim(world,plan,vehicle,4,33)).toThrow();
  expect(refineInterplanetaryAim(world,plan,{...vehicle,fuelKg:0},4,4)).toBeNull();
 });
});

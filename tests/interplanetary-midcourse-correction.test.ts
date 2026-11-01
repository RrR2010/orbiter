import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {correctLambertMidcourse} from '../src/simulation/interplanetary-midcourse-correction';

describe('physical Lambert midcourse correction',()=>{
 const world=generateWorld('phase-five-injection');
 const [home,target]=world.bodies.filter(body=>body.kind==='planet');
 const standard=designVehicle(gravityForRadius(home.radius),4,3000,.5);
 const vehicle={...standard,ispS:1e7};
 it('corrects only velocity at the real checkpoint and accounts for propellant',()=>{
  const result=correctLambertMidcourse(world,home.id,target.id,1e6,5e6,vehicle);
  expect(result).not.toBeNull();
  expect(result!.checkpointBefore.position).toEqual(result!.checkpointAfter.position);
  expect(result!.checkpointBefore.timeS).toBe(result!.checkpointAfter.timeS);
  expect(result!.fuelSpentKg).toBeGreaterThanOrEqual(0);
  expect(result!.checkpointBefore.fuelKg-result!.checkpointAfter.fuelKg)
   .toBeCloseTo(result!.fuelSpentKg,8);
  expect(result!.checkpointAfter.massKg-result!.checkpointAfter.fuelKg)
   .toBeCloseTo(vehicle.dryKg,8);
  expect(result!.missAfterM).toBeLessThan(10000);
  expect(result!.missAfterM).toBeLessThan(result!.missBeforeM);
  expect(result).toEqual(correctLambertMidcourse(world,home.id,target.id,1e6,5e6,vehicle));
 });
 it('never corrects a probe without fuel or outside the checkpoint window',()=>{
  expect(()=>correctLambertMidcourse(world,home.id,target.id,1e6,5e6,vehicle,0)).toThrow();
  expect(correctLambertMidcourse(world,home.id,target.id,1e6,5e6,
   {...standard,fuelKg:0})).toBeNull();
 });
});

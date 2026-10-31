import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planVectorEscape} from '../src/simulation/interplanetary-vector-escape';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {planetSphereOfInfluence} from '../src/simulation/interplanetary-handoff';

describe('Lambert-directed planetary SOI escape',()=>{
 const world=generateWorld('phase-five-injection');
 const [home,target]=world.bodies.filter(b=>b.kind==='planet');
 const standard=designVehicle(gravityForRadius(home.radius),4,3000,.5);
 const vehicle={...standard,ispS:1e7};
 it('physically reaches the SOI in the requested vector direction',()=>{
  const result=planVectorEscape(world,home.id,target.id,1e6,5e6,vehicle);
  expect(result).not.toBeNull();
  const escape=result!.escape;
  expect(Math.hypot(escape.localAtBoundary.position.x,escape.localAtBoundary.position.y))
   .toBeCloseTo(planetSphereOfInfluence(home),-1);
  expect(Math.abs(result!.directionErrorRad)).toBeLessThan(1e-8);
  expect(escape.localAtBoundary.massKg).toBeCloseTo(result!.initial.massKg,7);
  expect(escape.localAtBoundary.fuelKg).toBeCloseTo(result!.initial.fuelKg,7);
  expect(escape.elapsedS).toBeGreaterThan(0);
  expect(result!.excessVelocityResidualMs).toBeGreaterThanOrEqual(0);
  expect(result).toEqual(planVectorEscape(world,home.id,target.id,1e6,5e6,vehicle));
 });
 it('rejects impossible propellant budget rather than fabricating a burn',()=>{
  expect(planVectorEscape(world,home.id,target.id,1e6,5e6,{...standard,fuelKg:0})).toBeNull();
 });
});

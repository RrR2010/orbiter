import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {orbitalPosition} from '../src/simulation/orbits';
import {measureClosestApproach} from '../src/simulation/interplanetary-closest-approach';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {correctLambertMidcourse} from '../src/simulation/interplanetary-midcourse-correction';

describe('controlled non-impacting physical Lambert flyby',()=>{
 const world=generateWorld('phase-five-injection');
 const [home,target]=world.bodies.filter(b=>b.kind==='planet');
 const vehicle={...designVehicle(gravityForRadius(home.radius),4,3000,.5),ispS:1e7};
 it('passes within the science envelope without impacting and pays for correction',()=>{
  const arrivalS=5e6;
  const correction=correctLambertMidcourse(world,home.id,target.id,1e6,arrivalS,vehicle,.5,3);
  expect(correction).not.toBeNull();
  const {checkpointAfter,arrival}=correction!;
  const atArrival=orbitalPosition(target.orbit!,arrivalS);
  const distance=Math.hypot(arrival.position.x-atArrival.x,arrival.position.y-atArrival.y);
  expect(distance/target.radius).toBeGreaterThan(1);
  expect(distance/target.radius).toBeLessThan(10);
  const approach=measureClosestApproach(checkpointAfter,target.orbit!,target.radius,arrivalS);
  expect(approach.distanceM).toBeGreaterThan(target.radius);
  expect(approach.distanceM).toBeLessThan(target.radius*10);
  expect(approach.altitudeM).toBeGreaterThan(0);
  expect(approach.timeS).toBeGreaterThanOrEqual(checkpointAfter.timeS);
  expect(approach.timeS).toBeLessThanOrEqual(arrivalS);
  expect(correction!.fuelSpentKg).toBeGreaterThan(0);
  expect(arrival.massKg).toBeLessThan(correction!.checkpointBefore.massKg);
 });
 it('preserves original impact-point targeting and rejects invalid aim offsets',()=>{
  const original=correctLambertMidcourse(world,home.id,target.id,1e6,5e6,vehicle);
  const explicit=correctLambertMidcourse(world,home.id,target.id,1e6,5e6,vehicle,.5,0);
  expect(original).toEqual(explicit);
  expect(()=>correctLambertMidcourse(world,home.id,target.id,1e6,5e6,vehicle,.5,11)).toThrow();
 });
});

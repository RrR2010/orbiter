import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {orbitalPosition} from '../src/simulation/orbits';
import {propagateCoast} from '../src/simulation/spaceflight/coast';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {correctLambertMidcourse} from '../src/simulation/interplanetary-midcourse-correction';

const SOLAR_MU=1.32712440018e20;

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
  let minimum=Infinity;
  for(let i=0;i<=128;i++){
   const time=checkpointAfter.timeS+(arrivalS-checkpointAfter.timeS)*i/128;
   const state=propagateCoast(checkpointAfter,{radiusM:1,muM3S2:SOLAR_MU},time-checkpointAfter.timeS);
   const position=orbitalPosition(target.orbit!,time);
   minimum=Math.min(minimum,Math.hypot(state.position.x-position.x,state.position.y-position.y));
  }
  expect(minimum).toBeGreaterThan(target.radius);
  expect(minimum).toBeLessThan(target.radius*10);
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

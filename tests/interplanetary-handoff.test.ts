import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {handoffToHeliocentric,planetSphereOfInfluence,planetaryVelocityAt} from '../src/simulation/interplanetary-handoff';
import {orbitalPosition} from '../src/simulation/orbits';

describe('planetary to heliocentric handoff',()=>{
 const world=generateWorld('phase-five-handoff');
 const home=world.bodies.find(body=>body.kind==='planet')!;
 const radius=planetSphereOfInfluence(home);
 const timeS=1e6;
 const local={position:{x:radius,y:0},velocity:{x:100,y:200},massKg:500,fuelKg:250,timeS};
 it('preserves absolute position, velocity, time and fuel through reference transformation',()=>{
  const state=handoffToHeliocentric(world,home.id,local);
  const center=orbitalPosition(home.orbit!,timeS),planetV=planetaryVelocityAt(home,timeS);
  expect(state.position.x-center.x).toBeCloseTo(radius,3);
  expect(state.position.y-center.y).toBeCloseTo(0,3);
  expect(state.velocity.x-planetV.x).toBeCloseTo(local.velocity.x,6);
  expect(state.velocity.y-planetV.y).toBeCloseTo(local.velocity.y,6);
  expect(state.timeS).toBe(timeS);
  expect(state.fuelKg).toBe(local.fuelKg);
  expect(state.massKg).toBe(local.massKg);
  expect(handoffToHeliocentric(world,home.id,local)).toEqual(state);
 });
 it('rejects handoff before physical SOI crossing',()=>{
  expect(()=>handoffToHeliocentric(world,home.id,{...local,position:{x:home.radius,y:0}})).toThrow();
 });
 it('has a finite positive gravitational boundary',()=>{
  expect(radius).toBeGreaterThan(0);
  expect(Number.isFinite(radius)).toBe(true);
 });
});

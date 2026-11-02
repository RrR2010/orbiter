import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {analyzeTrajectory} from '../src/simulation/spaceflight/conics';
import {propagateCoast} from '../src/simulation/spaceflight/coast';
import {bodyFrame,fromLocalFlight,solarFrame,transformState} from '../src/simulation/reference-frames';

/** Numerical reference from the analytic two-body circular-orbit solution. */
describe('phase 7 quantitative orbital golden fixture',()=>{
 const world=generateWorld('phase7-circular-golden');
 const planet=world.bodies.find(b=>b.kind==='planet')!;
 const mu=gravityForRadius(planet.radius).muM3S2;
 const radius=planet.radius+400000;
 const speed=Math.sqrt(mu/radius);
 const period=2*Math.PI*Math.sqrt(radius**3/mu);
 const epochS=86400;
 const initial={position:{x:radius,y:0},velocity:{x:0,y:speed},massKg:1000,fuelKg:250,timeS:epochS};
 it('preserves a physically inserted circular orbit after one analytic period',()=>{
  const orbit=analyzeTrajectory(initial,gravityForRadius(planet.radius));
  expect(orbit.kind).toBe('elliptic');
  expect(orbit.surfaceIntersecting).toBe(false);
  expect(orbit.periapsisM).toBeCloseTo(radius,2);
  expect(orbit.apoapsisM!).toBeCloseTo(radius,2);
  const final=propagateCoast(initial,gravityForRadius(planet.radius),period);
  expect(Math.hypot(final.position.x-radius,final.position.y)).toBeLessThan(1);
  expect(Math.hypot(final.velocity.x,final.velocity.y-speed)).toBeLessThan(1e-4);
  expect(final.massKg).toBe(1000);
  expect(final.fuelKg).toBe(250);
  expect(final.timeS).toBeCloseTo(epochS+period,6);
 });
 it('preserves the same physical orbit through the universal frame adapter',()=>{
  const local=fromLocalFlight('circular-orbiter',planet.id,initial);
  const solar=transformState(world,local,solarFrame);
  const restored=transformState(world,solar,bodyFrame(planet.id));
  expect(Math.hypot(restored.positionM.x-radius,restored.positionM.y)).toBeLessThan(1e-3);
  expect(Math.hypot(restored.velocityMs.x,restored.velocityMs.y-speed)).toBeLessThan(1e-5);
  expect(restored.massKg).toBe(1000);
  expect(restored.fuelKg).toBe(250);
  expect(restored.epochS).toBe(epochS);
 });
});

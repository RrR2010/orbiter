import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planTransferOpportunity} from '../src/simulation/interplanetary-planner';
import {planEscapeInjection} from '../src/simulation/interplanetary-injection';
import {propagatePlanetaryEscape} from '../src/simulation/interplanetary-escape';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {orbitalPosition} from '../src/simulation/orbits';

describe('escape injection from established parking orbit',()=>{
 const world=generateWorld('phase-five-injection');
 const planets=world.bodies.filter(body=>body.kind==='planet');
 const home=planets[0],target=planets[1];
 const opportunity=planTransferOpportunity(world,home.id,target.id,1e6)!;
 const vehicle=designVehicle(gravityForRadius(home.radius),4,3000,.5);
 it('consumes propellant and produces a finite hyperbolic injection',()=>{
  const injection=planEscapeInjection(home,target,opportunity,vehicle,opportunity.departureS);
  expect(injection).not.toBeNull();
  expect(injection!.burnDeltaVMs).toBeGreaterThan(0);
  expect(injection!.fuelSpentKg).toBeGreaterThan(0);
  expect(injection!.fuelRemainingKg).toBeGreaterThanOrEqual(0);
  expect(injection!.state.massKg).toBeCloseTo(vehicle.dryKg+injection!.fuelRemainingKg,6);
  expect(injection).toEqual(planEscapeInjection(home,target,opportunity,vehicle,opportunity.departureS));
  const escape=propagatePlanetaryEscape(world,home.id,injection!.state,365*86400);
  expect(escape).not.toBeNull();
  expect(escape!.heliocentric.fuelKg).toBeCloseTo(injection!.fuelRemainingKg,6);
  expect(escape!.heliocentric.timeS).toBeGreaterThan(injection!.state.timeS);
 });
 it('aligns the hyperbolic impulse with actual planetary prograde direction',()=>{
  const injection=planEscapeInjection(home,target,opportunity,vehicle,opportunity.departureS)!;
  const step=10;
  const a=orbitalPosition(home.orbit!,opportunity.departureS-step);
  const b=orbitalPosition(home.orbit!,opportunity.departureS+step);
  const velocity=injection.state.velocity;
  const dot=velocity.x*(b.x-a.x)+velocity.y*(b.y-a.y);
  expect(dot).toBeGreaterThan(0);
  const radial=injection.state.position.x*velocity.x+injection.state.position.y*velocity.y;
  expect(Math.abs(radial)).toBeLessThan(1e-3);
 });
 it('changes physical heading without changing the required ideal burn',()=>{
  const base=planEscapeInjection(home,target,opportunity,vehicle,opportunity.departureS)!;
  const steered=planEscapeInjection(home,target,opportunity,vehicle,opportunity.departureS,.15)!;
  expect(steered.burnDeltaVMs).toBeCloseTo(base.burnDeltaVMs,9);
  expect(steered.fuelSpentKg).toBeCloseTo(base.fuelSpentKg,9);
  expect(steered.state.velocity).not.toEqual(base.state.velocity);
  expect(Math.hypot(steered.state.velocity.x,steered.state.velocity.y))
   .toBeCloseTo(Math.hypot(base.state.velocity.x,base.state.velocity.y),8);
  expect(()=>planEscapeInjection(home,target,opportunity,vehicle,opportunity.departureS,Math.PI)).toThrow();
 });
 it('cannot inject with insufficient propellant',()=>{
  expect(planEscapeInjection(home,target,opportunity,{...vehicle,fuelKg:0},opportunity.departureS)).toBeNull();
 });
 it('does not accept mismatched departure endpoints',()=>{
  expect(()=>planEscapeInjection(target,home,opportunity,vehicle,opportunity.departureS)).toThrow();
 });
});

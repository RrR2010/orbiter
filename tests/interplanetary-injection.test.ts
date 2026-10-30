import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planTransferOpportunity} from '../src/simulation/interplanetary-planner';
import {planEscapeInjection} from '../src/simulation/interplanetary-injection';
import {propagatePlanetaryEscape} from '../src/simulation/interplanetary-escape';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

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
 it('cannot inject with insufficient propellant',()=>{
  expect(planEscapeInjection(home,target,opportunity,{...vehicle,fuelKg:0},opportunity.departureS)).toBeNull();
 });
 it('does not accept mismatched departure endpoints',()=>{
  expect(()=>planEscapeInjection(target,home,opportunity,vehicle,opportunity.departureS)).toThrow();
 });
});

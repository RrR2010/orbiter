import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization} from '../src/simulation/civilization';
import {proposeInterplanetaryLaunch} from '../src/simulation/interplanetary-schedule';
import {findLambertLaunchWindow} from '../src/simulation/interplanetary-lambert-window';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

describe('bounded Lambert window around antipodal Hohmann alignment',()=>{
 it('preserves time of flight and never fabricates a fuel-feasible maneuver',()=>{
  const world=generateWorld('phase-five-injection'),c=createCivilization(world);
  c.stage=4;c.knowledge=3000;c.resources=300;
  const intent=proposeInterplanetaryLaunch(c,world,c.time);
  expect(intent).not.toBeNull();
  const home=world.bodies.find(body=>body.id===c.homeId)!;
  const vehicle=designVehicle(gravityForRadius(home.radius),4,3000,.5);
  const plan=intent!.candidate.opportunity;
  const first=findLambertLaunchWindow(world,plan,vehicle);
  expect(findLambertLaunchWindow(world,plan,vehicle)).toEqual(first);
  if(first){
   expect(first.departureS).toBeGreaterThanOrEqual(0);
   expect(first.arrivalS-first.departureS).toBeCloseTo(plan.transferTimeS,6);
   expect(first.plan.feasible).toBe(true);
   expect(first.plan.requiredFuelKg).toBeLessThanOrEqual(vehicle.fuelKg);
   expect(Math.abs(first.offsetS)).toBeLessThanOrEqual(259200);
  }
 });
});

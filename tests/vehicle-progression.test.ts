import {describe,expect,it} from 'vitest';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {generateWorld} from '../src/simulation/world';
import {createAutonomousFlightV2} from '../src/simulation/spaceflight/flight-v2';

describe('vehicle technology and accumulated knowledge',()=>{
 it('advances tank, mass, efficiency and targeting precision monotonically',()=>{
  const planet=gravityForRadius(6371000);
  const early=designVehicle(planet,1,0,.5);
  const advanced=designVehicle(planet,4,100000,.5);
  expect(advanced.fuelKg).toBeGreaterThan(early.fuelKg);
  expect(advanced.dryKg).toBeLessThan(early.dryKg);
  expect(advanced.ispS).toBeGreaterThanOrEqual(early.ispS);
  expect(advanced.deltaVMs).toBeGreaterThan(early.deltaVMs);
  expect(advanced.guidanceError).toBeLessThan(early.guidanceError);
  expect(advanced.reserveFraction).toBeGreaterThan(early.reserveFraction);
  expect(designVehicle(planet,4,100000,.5)).toEqual(advanced);
 });
 it('uses experience in new mission designs but leaves existing mission plans unchanged',()=>{
  const world=generateWorld('technological-progression');
  const body=world.bodies.find(b=>b.kind==='planet')!;
  const novice=createAutonomousFlightV2(world.seed,'mission-1',body,0,1,0);
  const veteran=createAutonomousFlightV2(world.seed,'mission-1',body,0,4,80000);
  expect(novice.vehicle).toBeDefined();
  expect(veteran.vehicle?.fuelKg).toBeGreaterThan(novice.vehicle!.fuelKg);
  expect(veteran.vehicle?.deltaVMs).toBeGreaterThan(novice.vehicle!.deltaVMs);
  expect(novice).toEqual(createAutonomousFlightV2(world.seed,'mission-1',body,0,1,0));
 });
});

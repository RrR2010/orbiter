import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {createAutonomousFlightV2,resolveAutonomousFlightV2} from '../src/simulation/spaceflight/flight-v2';
import {handoffToHeliocentric,planetaryVelocityAt,planetSphereOfInfluence} from '../src/simulation/interplanetary-handoff';
import {orbitalPosition} from '../src/simulation/orbits';

/** M0 baseline: immutable, seeded observations of the current local and SOI pipelines. */
describe('phase 7 M0 baseline before frame migration',()=>{
 it('repeats local flight plans and resolved checkpoints for fixed inputs',()=>{
  const world=generateWorld('phase7-m0-local'),planet=world.bodies.find(b=>b.kind==='planet')!;
  const run=()=>resolveAutonomousFlightV2(createAutonomousFlightV2(world.seed,'m0-launch',planet,100,4),gravityForRadius(planet.radius));
  const first=run();
  expect(run()).toEqual(first);
  expect(first.checkpoints.length).toBeGreaterThan(0);
 });
 it('preserves heliocentric position, velocity and vehicle resources at SOI handoff',()=>{
  const world=generateWorld('phase7-m0-handoff'),planet=world.bodies.find(b=>b.kind==='planet')!;
  const timeS=86400,local={position:{x:planetSphereOfInfluence(planet)*1.001,y:0},velocity:{x:250,y:-120},massKg:1000,fuelKg:300,timeS};
  const actual=handoffToHeliocentric(world,planet.id,local);
  const origin=orbitalPosition(planet.orbit!,timeS),velocity=planetaryVelocityAt(planet,timeS);
  expect(actual.position.x-origin.x).toBeCloseTo(local.position.x,2);
  expect(actual.position.y-origin.y).toBeCloseTo(local.position.y,2);
  expect(actual.velocity.x-velocity.x).toBeCloseTo(local.velocity.x,7);
  expect(actual.velocity.y-velocity.y).toBeCloseTo(local.velocity.y,7);
  expect(actual.massKg).toBe(local.massKg);
  expect(actual.fuelKg).toBe(local.fuelKg);
 });
});

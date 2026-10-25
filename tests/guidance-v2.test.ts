import {describe,expect,it} from 'vitest';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {decideGuidance,availableDeltaV,burnDurationForDeltaV} from '../src/simulation/spaceflight/guidance-v2';
import type {FlightState} from '../src/simulation/spaceflight/types';

const planet=gravityForRadius(6371000),radius=planet.radiusM+500000,mu=planet.muM3S2;
const circular:FlightState={position:{x:radius,y:0},velocity:{x:0,y:Math.sqrt(mu/radius)},massKg:1200,fuelKg:250,timeS:500};
const goal={periapsisAltitudeM:500000,apoapsisAltitudeM:500000,toleranceM:10000};
describe('goal driven v2 guidance',()=>{
 it('recognizes a goal without firing engines',()=>{
  const decision=decideGuidance(circular,planet,goal,340);
  expect(decision.action).toBe('goal-achieved');
  expect(decision.desiredDeltaVMs).toBe(0);
 });
 it('requests apoapsis energy when the orbit is below target',()=>{
  const decision=decideGuidance(circular,planet,{...goal,apoapsisAltitudeM:1300000},340);
  expect(decision.action).toBe('raise-apoapsis');
  expect(decision.desiredDeltaVMs).toBeGreaterThan(0);
 });
 it('requests apoapsis maneuver when periapsis is too low',()=>{
  const atApoapsis={...circular,velocity:{x:0,y:circular.velocity.y*.8}};
  const decision=decideGuidance(atApoapsis,planet,goal,340);
  expect(['coast-to-apoapsis','raise-periapsis']).toContain(decision.action);
  expect(decision.desiredDeltaVMs).toBeGreaterThan(0);
 });
 it('refuses propellant-free corrections',()=>{
  const empty={...circular,fuelKg:0};
  expect(decideGuidance(empty,planet,{...goal,apoapsisAltitudeM:1500000},340).action).toBe('partial-orbit');
  expect(availableDeltaV(empty,340)).toBe(0);
  expect(burnDurationForDeltaV(empty,340,15000,100)).toBe(0);
 });
 it('derives burn duration from impulse and thrust, not a preset duration',()=>{
  const low=burnDurationForDeltaV(circular,340,15000,250);
  const high=burnDurationForDeltaV(circular,340,30000,250);
  expect(low).toBeGreaterThan(0);expect(high).toBeCloseTo(low/2,8);
  expect(burnDurationForDeltaV(circular,340,15000,1e9)).toBeCloseTo(circular.fuelKg*340*9.80665/15000,5);
 });
});

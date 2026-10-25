import {describe,expect,it} from 'vitest';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {analyzeTrajectory} from '../src/simulation/spaceflight/conics';
import {nextApoapsis,planApoapsisCircularization} from '../src/simulation/spaceflight/maneuvers';
import type {FlightState} from '../src/simulation/spaceflight/types';

const planet=gravityForRadius(6371000),mu=planet.muM3S2;
const ra=planet.radiusM+800000,rp=planet.radiusM+100000,a=(ra+rp)/2;
const vA=Math.sqrt(mu*(2/ra-1/a));
const initial:FlightState={position:{x:ra,y:0},velocity:{x:0,y:vA},massKg:5000,fuelKg:2500,timeS:10};
describe('apoapsis maneuvers',()=>{
 it('plans a fueled prograde burn to raise periapsis without inventing energy',()=>{
  const orbit=analyzeTrajectory(initial,planet);
  expect(orbit.periapsisM).toBeCloseTo(rp,0);
  const t=nextApoapsis(initial,planet);
  expect(t).not.toBeNull();
  const maneuver=planApoapsisCircularization(initial,planet,450000,350);
  expect(maneuver).not.toBeNull();
  if(!maneuver)return;
  expect(maneuver.deltaVMs).toBeGreaterThan(0);
  expect(maneuver.fuelKg).toBeGreaterThan(0);
  expect(maneuver.after.massKg).toBeLessThan(initial.massKg);
  expect(analyzeTrajectory(maneuver.after,planet).periapsisM).toBeGreaterThan(orbit.periapsisM);
 });
 it('refuses a maneuver if no fuel or if periapsis already exceeds the target',()=>{
  expect(planApoapsisCircularization(initial,planet,50000,350)).toBeNull();
  const empty={...initial,fuelKg:0};
  expect(planApoapsisCircularization(empty,planet,450000,350)).toBeNull();
  expect(empty.massKg).toBe(initial.massKg);
 });
});

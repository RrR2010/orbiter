import {describe,expect,it} from 'vitest';
import {gravityForRadius,gravityAcceleration} from '../src/simulation/spaceflight/gravity';
import {propagateCoast,propagateUntilImpact} from '../src/simulation/spaceflight/coast';
import {analyzeTrajectory} from '../src/simulation/spaceflight/conics';
import {coastStep,poweredStep,advancePowered,sampleBurnAt} from '../src/simulation/spaceflight/integrator';
import type {FlightState} from '../src/simulation/spaceflight/types';

const earth=gravityForRadius(6371000),mu=earth.muM3S2,r=earth.radiusM+400000,v=Math.sqrt(mu/r);
const circular:FlightState={position:{x:r,y:0},velocity:{x:0,y:v},massKg:1000,fuelKg:400,timeS:0};
const burn={startS:0,endS:120,thrustN:20000,ispS:300,progradeFraction:1};

describe('planet-centered flight mechanics',()=>{
 it('derives bounded deterministic gravity from unchanged planet radius',()=>{
  expect(gravityForRadius(6371000)).toEqual(earth);
  expect(gravityAcceleration({x:r,y:0},mu).x).toBeCloseTo(-mu/r**2,8);
  expect(()=>gravityForRadius(-1)).toThrow();
 });
 it('classifies circular, elliptical, surface-intersecting and escape trajectories',()=>{
  const circle=analyzeTrajectory(circular,earth);
  expect(circle.kind).toBe('elliptic');
  expect(circle.eccentricity).toBeLessThan(1e-10);
  expect(circle.periapsisM).toBeCloseTo(r,2);
  expect(circle.apoapsisM).toBeCloseTo(r,2);
  expect(circle.surfaceIntersecting).toBe(false);
  const sub=analyzeTrajectory({...circular,velocity:{x:0,y:v*.7}},earth);
  expect(sub.surfaceIntersecting).toBe(true);
  expect(sub.apoapsisM).not.toBeNull();
  expect(analyzeTrajectory({...circular,velocity:{x:0,y:v*1.5}},earth).kind).toBe('hyperbolic');
 });
 it('conserves two-body orbital invariants during a short unpowered interval',()=>{
  let state=circular;
  const energy=analyzeTrajectory(state,earth).energyJkg;
  for(let i=0;i<1000;i++)state=coastStep(state,earth,1);
  const actual=analyzeTrajectory(state,earth);
  expect(Math.abs((actual.energyJkg-energy)/energy)).toBeLessThan(1e-6);
  expect(Math.abs(actual.eccentricity)).toBeLessThan(1e-5);
  expect(state.fuelKg).toBe(400);
 });
 it('consumes fuel, changes tangential velocity and never burns below dry mass',()=>{
  const launched=poweredStep(circular,earth,1,burn);
  expect(launched.fuelKg).toBeLessThan(circular.fuelKg);
  expect(launched.massKg-launched.fuelKg).toBeCloseTo(600,9);
  expect(launched.velocity.y).toBeGreaterThan(circular.velocity.y);
  const exhausted=poweredStep({...circular,fuelKg:0},earth,1,burn);
  expect(exhausted.massKg).toBe(1000);
 });
 it('propagates a coast analytically regardless of partitioning',()=>{
  const a=propagateCoast(circular,earth,900);
  const b=propagateCoast(propagateCoast(circular,earth,300),earth,600);
  expect(Math.hypot(a.position.x-b.position.x,a.position.y-b.position.y)).toBeLessThan(.02);
  expect(Math.hypot(a.velocity.x-b.velocity.x,a.velocity.y-b.velocity.y)).toBeLessThan(1e-4);
  expect(analyzeTrajectory(a,earth).eccentricity).toBeLessThan(1e-8);
 });
 it('detects suborbital impact without mutating mission state',()=>{
  const sub={...circular,velocity:{x:0,y:v*.7}};
  const result=propagateUntilImpact(sub,earth,20000);
  expect(result.impacted).toBe(true);
  expect(result.state.timeS).toBeGreaterThan(0);
  expect(Math.abs(Math.hypot(result.state.position.x,result.state.position.y)-earth.radiusM)).toBeLessThan(1);
  expect(sub.timeS).toBe(0);
 });
 it('samples a partial burn from a fixed checkpoint regardless of requested frames',()=>{
  const a=sampleBurnAt(circular,earth,67.37,burn);
  sampleBurnAt(circular,earth,9.23,burn);
  sampleBurnAt(circular,earth,30.91,burn);
  const b=sampleBurnAt(circular,earth,67.37,burn);
  expect(b).toEqual(a);
  expect(sampleBurnAt(circular,earth,67,burn).timeS).toBe(67);
 });
 it('keeps bound orbit stable over many complete revolutions',()=>{
  const period=analyzeTrajectory(circular,earth).periodS!;
  const after=propagateCoast(circular,earth,period*50+90);
  const first=propagateCoast(circular,earth,90);
  expect(Math.hypot(after.position.x-first.position.x,after.position.y-first.position.y)).toBeLessThan(.01);
 });
 it('does not invent an impact on stable circular orbits',()=>{
  const period=analyzeTrajectory(circular,earth).periodS!;
  expect(propagateUntilImpact(circular,earth,period*100).impacted).toBe(false);
 });
 it('uses a fixed time grid across partition boundaries',()=>{
  const single=advancePowered(circular,earth,80,burn);
  const split=advancePowered(advancePowered(circular,earth,20,burn),earth,80,burn);
  expect(split.position.x).toBeCloseTo(single.position.x,5);
  expect(split.position.y).toBeCloseTo(single.position.y,5);
  expect(split.velocity.x).toBeCloseTo(single.velocity.x,8);
  expect(split.velocity.y).toBeCloseTo(single.velocity.y,8);
  expect(split.fuelKg).toBeCloseTo(single.fuelKg,9);
 });
});

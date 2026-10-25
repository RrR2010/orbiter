import {describe,expect,it} from 'vitest';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {predictLocalOrbit} from '../src/rendering/predicted-orbit';
import type {FlightState} from '../src/simulation/spaceflight/types';

const planet=gravityForRadius(6371000),radius=planet.radiusM+400000;
const state:FlightState={position:{x:radius,y:0},velocity:{x:0,y:Math.sqrt(planet.muM3S2/radius)},massKg:1000,fuelKg:100,timeS:100};
describe('predicted orbital overlay',()=>{
 it('draws a circular stable orbit at the physical radius',()=>{
  const forecast=predictLocalOrbit(state,planet)!;
  expect(forecast.closed).toBe(true);expect(forecast.impactRisk).toBe(false);
  expect(forecast.points.length).toBe(97);
  for(const p of forecast.points)expect(Math.abs(Math.hypot(p.x,p.y)-radius)).toBeLessThan(.01);
 });
 it('clips predicted sections beneath the surface without changing state',()=>{
  const sub={...state,velocity:{x:0,y:state.velocity.y*.7}};
  const before=JSON.stringify(sub),forecast=predictLocalOrbit(sub,planet)!;
  expect(forecast.impactRisk).toBe(true);
  expect(forecast.points.some(p=>Number.isNaN(p.x))).toBe(true);
  expect(forecast.points.some(p=>Number.isFinite(p.x))).toBe(true);
  expect(JSON.stringify(sub)).toBe(before);
 });
 it('does not invent elliptical trajectories for escape speeds',()=>{
  const escape={...state,velocity:{x:0,y:state.velocity.y*1.5}};
  expect(predictLocalOrbit(escape,planet)).toBeNull();
 });
});

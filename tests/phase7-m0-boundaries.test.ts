import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {analyzeTrajectory} from '../src/simulation/spaceflight/conics';
import {assessPlanetaryApproach} from '../src/simulation/interplanetary-approach';
import {parseSave,serializeSave} from '../src/persistence/save';

/** Fixed physical classification boundaries and legacy persistence behavior before M1. */
describe('phase 7 M0 orbital, encounter and save boundaries',()=>{
 const world=generateWorld('phase7-m0-boundaries'),planet=world.bodies.find(b=>b.kind==='planet')!;
 it('classifies a stable circular orbit without surface intersection',()=>{
  const gravity=gravityForRadius(planet.radius),r=planet.radius+300000;
  const state={position:{x:r,y:0},velocity:{x:0,y:Math.sqrt(gravity.muM3S2/r)},massKg:1000,fuelKg:200,timeS:86400};
  const trajectory=analyzeTrajectory(state,gravity);
  expect(trajectory.kind).toBe('elliptic');
  expect(trajectory.surfaceIntersecting).toBe(false);
  expect(trajectory.periapsisM).toBeCloseTo(r,2);
  expect(trajectory.apoapsisM).not.toBeNull();
  expect(trajectory.apoapsisM!).toBeCloseTo(r,2);
 });
 it('classifies positive flyby, distant miss and impact-risk using physical distances',()=>{
  const evaluate=(distance:number)=>assessPlanetaryApproach({
   closestDistanceM:distance,closestAltitudeM:distance-planet.radius,closestRelativeSpeedMs:2500,
  } as Parameters<typeof assessPlanetaryApproach>[0],planet);
  expect(evaluate(planet.radius*2).outcome).toBe('flyby');
  expect(evaluate(planet.radius*11).outcome).toBe('distant-miss');
  expect(evaluate(planet.radius*.9).outcome).toBe('impact-risk');
  expect(evaluate(planet.radius*10).outcome).toBe('flyby');
 });
 it('accepts valid V2 saves and rejects malformed, incomplete or obsolete payloads',()=>{
  const valid={version:2 as const,seed:'phase7-m0-save',time:86400,warp:100 as const,camera:{x:0,y:0,zoom:1}};
  expect(parseSave(serializeSave(valid))).toEqual(valid);
  expect(parseSave(JSON.stringify({...valid,camera:undefined}))).toBeNull();
  expect(parseSave(JSON.stringify({...valid,version:1}))).toBeNull();
  expect(parseSave('{invalid')).toBeNull();
 });
});

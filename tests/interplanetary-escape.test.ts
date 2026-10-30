import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {planetSphereOfInfluence} from '../src/simulation/interplanetary-handoff';
import {propagatePlanetaryEscape} from '../src/simulation/interplanetary-escape';

describe('physical planetary escape',()=>{
 const world=generateWorld('phase-five-escape');
 const home=world.bodies.find(body=>body.kind==='planet')!;
 const mu=gravityForRadius(home.radius).muM3S2;
 const distance=home.radius*1.2;
 const escapeSpeed=Math.sqrt(2*mu/distance);
 const initial={position:{x:distance,y:0},velocity:{x:escapeSpeed*1.5,y:0},massKg:500,fuelKg:200,timeS:1e6};
 it('crosses the SOI without jumping forward in time or modifying mass',()=>{
  const result=propagatePlanetaryEscape(world,home.id,initial);
  expect(result).not.toBeNull();
  const crossing=result!;
  expect(crossing.elapsedS).toBeGreaterThan(0);
  expect(crossing.localAtBoundary.timeS).toBeCloseTo(initial.timeS+crossing.elapsedS,4);
  expect(Math.hypot(crossing.localAtBoundary.position.x,crossing.localAtBoundary.position.y)/
   planetSphereOfInfluence(home)).toBeCloseTo(1,6);
  expect(crossing.heliocentric.massKg).toBe(500);
  expect(crossing.heliocentric.fuelKg).toBe(200);
  expect(propagatePlanetaryEscape(world,home.id,initial)).toEqual(result);
 });
 it('rejects bound trajectories, descending states and invalid intervals',()=>{
  expect(propagatePlanetaryEscape(world,home.id,{...initial,velocity:{x:escapeSpeed*.5,y:0}})).toBeNull();
  expect(propagatePlanetaryEscape(world,home.id,{...initial,velocity:{x:-escapeSpeed*1.5,y:0}})).toBeNull();
  expect(()=>propagatePlanetaryEscape(world,home.id,initial,-1)).toThrow();
 });
 it('cannot reach the boundary when available time is insufficient',()=>{
  expect(propagatePlanetaryEscape(world,home.id,initial,1)).toBeNull();
 });
});

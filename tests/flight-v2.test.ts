import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {createAutonomousFlightV2,resolveAutonomousFlightV2,sampleAutonomousFlightWithPlanet} from '../src/simulation/spaceflight/flight-v2';

describe('isolated V2 mission prototype',()=>{
 it('returns immutable deterministic plans and checkpoint results for the same seed',()=>{
  const world=generateWorld('v2-prototype');
  const planet=world.bodies.find(b=>b.kind==='planet')!;
  const a=createAutonomousFlightV2(world.seed,'mission-1',planet,100,4);
  const b=createAutonomousFlightV2(world.seed,'mission-1',planet,100,4);
  expect(a).toEqual(b);
  const gravity=gravityForRadius(planet.radius);
  expect(resolveAutonomousFlightV2(a,gravity)).toEqual(resolveAutonomousFlightV2(b,gravity));
 });
 it('samples results without mutation or render-time RNG',()=>{
  const world=generateWorld('v2-prototype-sampling');
  const planet=world.bodies.find(b=>b.kind==='planet')!;
  const gravity=gravityForRadius(planet.radius);
  const result=resolveAutonomousFlightV2(createAutonomousFlightV2(world.seed,'mission-2',planet,0,4),gravity);
  const before=JSON.stringify(result);
  const time=result.checkpoints[0].timeS;
  const sample=sampleAutonomousFlightWithPlanet(result,gravity,time);
  expect(sample).toEqual(result.plan.initial);
  expect(JSON.stringify(result)).toBe(before);
 });
});

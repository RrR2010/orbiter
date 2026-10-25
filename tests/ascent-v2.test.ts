import {describe,it,expect} from 'vitest';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {executeAscentV2} from '../src/simulation/spaceflight/ascent-v2';
const planet=gravityForRadius(6371000);
const initial={position:{x:planet.radiusM+10,y:0},velocity:{x:0,y:0},massKg:2000,fuelKg:1450,timeS:0};
const options={targetApoapsisAltitudeM:300000,thrustN:65000,ispS:380,profile:'gradual' as const,navigationError:0,reservedFuelKg:220,stepS:1,maxDurationS:800};
describe('feedback ascent v2',()=>{
 it('reproduces checkpoints with conserved dry mass',()=>{
  const a=executeAscentV2(initial,planet,options);
  expect(a).toEqual(executeAscentV2(initial,planet,options));
  expect(a.state.massKg-a.state.fuelKg).toBeCloseTo(550,6);
  expect(a.checkpoints[0].state).toEqual(initial);
  expect(a.checkpoints.at(-1)?.state).toEqual(a.state);
 });
 it('guidance profile changes the actual trajectory',()=>{
  const a=executeAscentV2(initial,planet,{...options,profile:'vertical'});
  const b=executeAscentV2(initial,planet,{...options,profile:'tangential'});
  expect(a.state.position).not.toEqual(b.state.position);
 });
});

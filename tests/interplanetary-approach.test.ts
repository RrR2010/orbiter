import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {assessPlanetaryApproach} from '../src/simulation/interplanetary-approach';
import type {ContinuousTransfer} from '../src/simulation/interplanetary-continuous-transfer';

describe('physical approach assessment',()=>{
 const planet=generateWorld('phase-five-approach').bodies.find(b=>b.kind==='planet')!;
 const assess=(distance:number)=>{
  const transfer={closestDistanceM:distance,closestAltitudeM:distance-planet.radius,closestRelativeSpeedMs:3500} as ContinuousTransfer;
  return assessPlanetaryApproach(transfer,planet);
 };
 it('distinguishes a positive altitude flyby from collision risk',()=>{
  expect(assess(planet.radius*2).outcome).toBe('flyby');
  expect(assess(planet.radius).outcome).toBe('impact-risk');
  expect(assess(planet.radius*.5).outcome).toBe('impact-risk');
 });
 it('does not award flyby to a physically distant probe',()=>{
  const miss=assess(planet.radius*20);
  expect(miss.outcome).toBe('distant-miss');
  expect(miss.encounterThresholdM).toBe(planet.radius*10);
  expect(miss.relativeSpeedMs).toBe(3500);
 });
 it('rejects fabricated geometry instead of producing a success',()=>{
  expect(()=>assessPlanetaryApproach({closestDistanceM:100,closestAltitudeM:100,closestRelativeSpeedMs:1} as ContinuousTransfer,planet)).toThrow();
  expect(()=>assessPlanetaryApproach({closestDistanceM:NaN,closestAltitudeM:0,closestRelativeSpeedMs:1} as ContinuousTransfer,planet)).toThrow();
 });
});

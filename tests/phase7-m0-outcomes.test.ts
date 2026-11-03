import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {propagateUntilImpact} from '../src/simulation/spaceflight/coast';
import {createAutonomousFlightV2} from '../src/simulation/spaceflight/flight-v2';
import {simulateLambertPhysicalTransfer} from '../src/simulation/interplanetary-lambert-physical-transfer';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {canTransmitProbeScience,probeCommunicationRangeM} from '../src/simulation/interplanetary-radio-link';

/** Pre-migration invariants for physical failure and communication boundaries. */
describe('phase 7 M0 physical outcomes',()=>{
 it('propagates failed insertion to a finite surface impact',()=>{
  const world=generateWorld('failed-insertion-descent'),home=world.bodies.find(b=>b.kind==='planet')!;
  const plan=createAutonomousFlightV2(world.seed,'test-flight',home,0,4);
  const initial={...plan.initial,position:{x:home.radius+100000,y:0},velocity:{x:-200,y:0}};
  const result=propagateUntilImpact(initial,gravityForRadius(home.radius),10000);
  expect(result.impacted).toBe(true);
  expect(result.state.timeS).toBeGreaterThan(initial.timeS);
  expect(Math.hypot(result.state.position.x,result.state.position.y)).toBeCloseTo(home.radius,2);
 });
 it('preserves actual transfer miss and refuses an unfueled transfer',()=>{
  const world=generateWorld('phase-five-injection'),[home,target]=world.bodies.filter(b=>b.kind==='planet');
  const standard=designVehicle(gravityForRadius(home.radius),4,3000,.5),vehicle={...standard,ispS:1e7};
  const result=simulateLambertPhysicalTransfer(world,home.id,target.id,1e6,5e6,vehicle)!;
  expect(result).not.toBeNull();
  expect(result.arrival.timeS).toBe(5e6);
  expect(result.closestDistanceM).toBeLessThanOrEqual(result.arrivalMissM);
  // Recorded physical miss from the deterministic pre-M1 transfer window.
  expect(result.closestDistanceM).toBeCloseTo(756056017.9902873,2);
  expect(result.closestAltitudeM).toBeCloseTo(743339890.9914939,2);
  expect(simulateLambertPhysicalTransfer(world,home.id,target.id,1e6,5e6,{...standard,fuelKg:0})).toBeNull();
 });
 it('maintains communication range boundary exactly',()=>{
  const max=probeCommunicationRangeM(4);
  expect(canTransmitProbeScience(max,4)).toBe(true);
  expect(canTransmitProbeScience(max+1,4)).toBe(false);
  expect(canTransmitProbeScience(1e12,2)).toBe(false);
 });
});

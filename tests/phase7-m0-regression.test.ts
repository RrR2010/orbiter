import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {solveLambert2D} from '../src/simulation/interplanetary-lambert';
import {propagateCoast} from '../src/simulation/spaceflight/coast';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {correctLambertMidcourse} from '../src/simulation/interplanetary-midcourse-correction';
import {createCivilization,advanceCivilization,parseCivilization,serializeCivilization} from '../src/simulation/civilization';
import {drainScience,enqueueScience} from '../src/simulation/interplanetary-science-inbox';

/** M0 regression probes execute against the unmodified physical pipelines. */
describe('phase 7 M0 cross-system regression',()=>{
 it('matches a deterministic Lambert quarter-orbit and coast arrival',()=>{
  const mu=1.32712440018e20,r=1e11,dt=Math.PI/2*Math.sqrt(r**3/mu);
  const solved=solveLambert2D({x:r,y:0},{x:0,y:r},dt,mu)!;
  expect(solved).not.toBeNull();
  const arrival=propagateCoast({position:{x:r,y:0},velocity:solved.departureVelocity,massKg:100,fuelKg:0,timeS:0},{radiusM:1,muM3S2:mu},dt);
  expect(Math.hypot(arrival.position.x,arrival.position.y-r)).toBeLessThan(100);
  expect(solveLambert2D({x:r,y:0},{x:0,y:r},dt,mu)).toEqual(solved);
 });
 it('keeps midcourse correction deterministic and accounts for propellant',()=>{
  const world=generateWorld('phase-five-injection'),[home,target]=world.bodies.filter(b=>b.kind==='planet');
  const vehicle={...designVehicle(gravityForRadius(home.radius),4,3000,.5),ispS:1e7};
  const run=()=>correctLambertMidcourse(world,home.id,target.id,1e6,5e6,vehicle);
  const result=run()!;
  expect(result).not.toBeNull();
  expect(result.checkpointAfter.position).toEqual(result.checkpointBefore.position);
  expect(result.checkpointBefore.fuelKg-result.checkpointAfter.fuelKg).toBeCloseTo(result.fuelSpentKg,8);
  expect(result.missAfterM).toBeLessThan(result.missBeforeM);
  expect(result.fuelSpentKg).toBeGreaterThan(0);
  expect(result.checkpointAfter.massKg).toBeCloseTo(result.checkpointBefore.massKg-result.fuelSpentKg,8);
  expect(result.checkpointAfter.fuelKg).toBeGreaterThanOrEqual(0);
  expect(result.checkpointAfter.timeS).toBe(result.checkpointBefore.timeS);
  expect(result.checkpointAfter.velocity).not.toEqual(result.checkpointBefore.velocity);
  expect(run()).toEqual(result);
 });
 it('roundtrips civilization state and delayed science without early reception',()=>{
  const world=generateWorld('science-save-checkpoint'),civilization=createCivilization(world);
  const target=world.bodies.find(b=>b.kind==='planet'&&b.id!==civilization.homeId)!;
  const observation={bodyId:target.id,observationId:'probe-one:gravity',measuredGravity:9.2,relativeError:.1,transmitted:true};
  civilization.scienceInbox=enqueueScience(civilization.scienceInbox!,{observation,transmission:{
   originId:civilization.homeId,targetId:target.id,observationAtS:1,receivedAtS:100,signalTravelS:99,distanceM:99*299792458,
  }});
  const restored=parseCivilization(serializeCivilization(civilization),world,0);
  expect(restored).toEqual(civilization);
  expect(restored.science!.knowledge[target.id].gravity.observations).toBe(0);
  const before=drainScience(restored.scienceInbox!,restored.science!,99);
  expect(before.deliveredIds).toEqual([]);
  expect(before.inbox.pending).toHaveLength(1);
  const atReception=drainScience(before.inbox,before.record,100);
  expect(atReception.deliveredIds).toEqual(['probe-one:gravity']);
  expect(atReception.inbox.pending).toHaveLength(0);
  expect(atReception.record.knowledge[target.id].gravity.observations).toBe(1);
  expect(drainScience(atReception.inbox,atReception.record,100).deliveredIds).toEqual([]);
 });
 it('retains resolved flight checkpoints through strategic save and reload',()=>{
  const world=generateWorld('v2-save-reset'),civilization=createCivilization(world);
  advanceCivilization(civilization,world,700000,10000);
  const restored=parseCivilization(serializeCivilization(civilization),world,civilization.time);
  expect(restored).toEqual(civilization);
  expect(restored.missions.some(m=>m.flight?.checkpoints.length)).toBe(true);
 });
});

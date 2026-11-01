import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {propagateCoast} from '../src/simulation/spaceflight/coast';
import {planTransferOpportunity} from '../src/simulation/interplanetary-planner';
import {createInterplanetaryTrajectory,evaluateInterplanetaryEncounter,interplanetaryStateAt} from '../src/simulation/interplanetary-trajectory';

describe('heliocentric probe propagation',()=>{
 const world=generateWorld('phase-five-trajectory');
 const planets=world.bodies.filter(body=>body.kind==='planet');
 const plan=planTransferOpportunity(world,planets[0].id,planets[1].id,1e6)!;
 const trajectory=createInterplanetaryTrajectory(world,plan);
 it('starts at the departure body and propagates deterministically',()=>{
  expect(interplanetaryStateAt(trajectory,plan.departureS)).toEqual(trajectory.initial);
  const first=interplanetaryStateAt(trajectory,plan.arrivalS);
  expect(first).toEqual(interplanetaryStateAt(trajectory,plan.arrivalS));
  expect(Number.isFinite(first.position.x)).toBe(true);
  expect(Number.isFinite(first.velocity.y)).toBe(true);
 });
 it('maintains a physical separation from the target rather than claiming a flyby by schedule',()=>{
  const encounter=evaluateInterplanetaryEncounter(world,trajectory);
  expect(encounter.closestTimeS).toBeGreaterThanOrEqual(plan.departureS);
  expect(encounter.closestTimeS).toBeLessThanOrEqual(plan.arrivalS);
  expect(encounter.closestDistanceM).toBeGreaterThanOrEqual(0);
  expect(encounter.relativeSpeedMs).toBeGreaterThanOrEqual(0);
  expect(Number.isFinite(encounter.arrivalDistanceM)).toBe(true);
  expect(encounter).toEqual(evaluateInterplanetaryEncounter(world,trajectory));
 });
 it('conserves heliocentric energy and angular momentum through coast',()=>{
  const mu=1.32712440018e20;
  const invariants=(time:number)=>{
   const {position:p,velocity:v}=interplanetaryStateAt(trajectory,time);
   return {
    energy:(v.x*v.x+v.y*v.y)/2-mu/Math.hypot(p.x,p.y),
    momentum:p.x*v.y-p.y*v.x
   };
  };
  const initial=invariants(plan.departureS),final=invariants(plan.arrivalS);
  expect(Math.abs((final.energy-initial.energy)/initial.energy)).toBeLessThan(1e-6);
  expect(Math.abs((final.momentum-initial.momentum)/initial.momentum)).toBeLessThan(1e-6);
 });
 it('returns equivalent positions under partitioned coast and absolute sampling',()=>{
  const mu=1.32712440018e20;
  const gravity={radiusM:1,muM3S2:mu};
  const duration=plan.transferTimeS,half=duration/2;
  const one=interplanetaryStateAt(trajectory,plan.arrivalS);
  const first=propagateCoast(trajectory.initial,gravity,half);
  const split=propagateCoast(first,gravity,duration-half);
  expect(Math.hypot(one.position.x-split.position.x,one.position.y-split.position.y)/
   Math.hypot(one.position.x,one.position.y)).toBeLessThan(1e-6);
  expect(Math.hypot(one.velocity.x-split.velocity.x,one.velocity.y-split.velocity.y)/
   Math.hypot(one.velocity.x,one.velocity.y)).toBeLessThan(1e-6);
 });
 it('does not classify an arbitrary deep-space miss as planetary contact',()=>{
  const encounter=evaluateInterplanetaryEncounter(world,trajectory);
  expect(encounter.withinTargetRadius).toBe(encounter.closestDistanceM<=planets[1].radius);
  expect(encounter.closestDistanceM).toBeGreaterThanOrEqual(0);
 });
 it('rejects invalid propagation epochs and resolution',()=>{
  expect(()=>interplanetaryStateAt(trajectory,plan.departureS-1)).toThrow();
  expect(()=>evaluateInterplanetaryEncounter(world,trajectory,2)).toThrow();
 });
});

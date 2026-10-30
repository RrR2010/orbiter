import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
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
 it('rejects invalid propagation epochs and resolution',()=>{
  expect(()=>interplanetaryStateAt(trajectory,plan.departureS-1)).toThrow();
  expect(()=>evaluateInterplanetaryEncounter(world,trajectory,2)).toThrow();
 });
});

import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planTransferOpportunity,rankTransferOpportunities} from '../src/simulation/interplanetary-planner';

describe('interplanetary transfer opportunity estimation',()=>{
 const world=generateWorld('phase-five-transfer');
 const planets=world.bodies.filter(body=>body.kind==='planet');
 it('plans finite, future opportunities for another planet deterministically',()=>{
  const first=planTransferOpportunity(world,planets[0].id,planets[1].id,1e7);
  expect(first).toEqual(planTransferOpportunity(world,planets[0].id,planets[1].id,1e7));
  expect(first).not.toBeNull();
  expect(first!.departureS).toBeGreaterThanOrEqual(1e7);
  expect(first!.arrivalS).toBeGreaterThan(first!.departureS);
  expect(first!.heliocentricDeltaVMs).toBeGreaterThan(0);
  expect(first!.phaseErrorRad).toBeLessThan(.2);
  expect(first!.approximate).toBe(true);
 });
 it('does not invent transfer plans for identical, nonexistent or nonplanet destinations',()=>{
  expect(planTransferOpportunity(world,planets[0].id,planets[0].id,0)).toBeNull();
  expect(planTransferOpportunity(world,planets[0].id,'missing',0)).toBeNull();
  expect(planTransferOpportunity(world,'star-0',planets[0].id,0)).toBeNull();
  expect(()=>planTransferOpportunity(world,planets[0].id,planets[1].id,-1)).toThrow();
 });
 it('ranks every eligible destination without mutating the world',()=>{
  const before=JSON.stringify(world);
  const ranked=rankTransferOpportunities(world,planets[0].id,2e6);
  expect(ranked).toHaveLength(planets.length-1);
  expect(new Set(ranked.map(item=>item.targetId)).size).toBe(ranked.length);
  expect(JSON.stringify(world)).toBe(before);
 });
});

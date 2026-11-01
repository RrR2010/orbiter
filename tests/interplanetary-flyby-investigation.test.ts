import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planTransferOpportunity} from '../src/simulation/interplanetary-planner';
import {diagnoseInterplanetaryTargeting} from '../src/simulation/interplanetary-targeting-diagnostic';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

/** Reproducible numerical investigation of a real procedural transfer.
 * Run directly to inspect the physical miss distance (in target radii):
 * npm run test -- tests/interplanetary-flyby-investigation.test.ts --reporter verbose
 */
describe('procedural flyby investigation',()=>{
 it('reports a physical targeting outcome instead of assuming a flyby',()=>{
  const world=generateWorld('phase-five-injection');
  const [home,target]=world.bodies.filter(body=>body.kind==='planet');
  const plan=planTransferOpportunity(world,home.id,target.id,1e6)!;
  const vehicle=designVehicle(gravityForRadius(home.radius),4,3000,.5);
  const diagnostic=diagnoseInterplanetaryTargeting(world,plan,vehicle,86400*15,4,4);
  const info={
   origin:home.id,target:target.id,phaseErrorRad:plan.phaseErrorRad,
   outcome:diagnostic.outcome,
   closestInTargetRadii:diagnostic.distanceInTargetRadii,
   closestAltitudeM:diagnostic.closestAltitudeM,
   evaluated:diagnostic.attempted,viable:diagnostic.successful,
   bestDepartureS:diagnostic.solution?.plan.departureS??null,
   bestAimRad:diagnostic.solution?.angleRad??null,
  };
  console.info('ORBITER PHASE 5 PHYSICAL TARGETING:',JSON.stringify(info));
  expect(info.evaluated).toBe(25);
  expect(info.viable).toBeGreaterThan(0);
  expect(info.viable).toBeLessThanOrEqual(info.evaluated);
  expect(info.closestInTargetRadii).not.toBeNull();
  expect(Number.isFinite(info.closestInTargetRadii)).toBe(true);
  expect(info.outcome).toBe(
   info.closestInTargetRadii!<=1?'impact-risk':
   info.closestInTargetRadii!<=10?'flyby':'distant-miss');
 });
});

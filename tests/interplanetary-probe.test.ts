import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planTransferOpportunity} from '../src/simulation/interplanetary-planner';
import {evaluateProbeMission,queueProbeScience} from '../src/simulation/interplanetary-probe';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

describe('physical probe mission evaluation',()=>{
 const world=generateWorld('phase-five-injection');
 const [origin,target]=world.bodies.filter(body=>body.kind==='planet');
 const plan=planTransferOpportunity(world,origin.id,target.id,1e6)!;
 const vehicle=designVehicle(gravityForRadius(origin.radius),4,3000,.5);
 it('evaluates actual post-escape geometry before granting any science',()=>{
  const result=evaluateProbeMission(world,plan,vehicle,'probe-eval');
  expect(result).not.toBeNull();
  expect(result!.assessment.closestDistanceM).toBe(result!.transfer.closestDistanceM);
  expect(result!.assessment.closestAltitudeM).toBe(result!.transfer.closestAltitudeM);
  expect(result!.observation===null).toBe(result!.assessment.outcome!=='flyby');
  const inbox=queueProbeScience({pending:[]},result!);
  expect(inbox.pending).toHaveLength(result!.observation?1:0);
  expect(result).toEqual(evaluateProbeMission(world,plan,vehicle,'probe-eval'));
 });
 it('cannot generate a message from a probe with no escape fuel',()=>{
  expect(evaluateProbeMission(world,plan,{...vehicle,fuelKg:0},'no-fuel')).toBeNull();
 });
});

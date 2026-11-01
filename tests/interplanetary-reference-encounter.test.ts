import {describe,expect,it} from 'vitest';
import {orbitalPeriod} from '../src/simulation/orbits';
import {generateWorld} from '../src/simulation/world';
import {createInterplanetaryTrajectory,evaluateInterplanetaryEncounter} from '../src/simulation/interplanetary-trajectory';
import type {TransferOpportunity} from '../src/simulation/interplanetary-planner';

const MU=1.32712440018e20;

/** Circular two-body reference case; isolates targeting from planetary escape. */
function circularReference(offset:number){
 const world=generateWorld('reference-flyby');
 const [origin,target]=world.bodies.filter(body=>body.kind==='planet');
 const r1=8e10,r2=1.3e11;
 const duration=Math.PI*Math.sqrt(((r1+r2)/2)**3/MU);
 const p1=orbitalPeriod(r1,MU),p2=orbitalPeriod(r2,MU);
 const phase2=Math.PI-2*Math.PI*duration/p2+offset;
 const bodies=world.bodies.map(body=>{
  if(body.id===origin.id)return {...body,radius:4e6,orbit:{semiMajorAxis:r1,eccentricity:0,phase:0,periapsisAngle:0,period:p1}};
  if(body.id===target.id)return {...body,radius:4e6,orbit:{semiMajorAxis:r2,eccentricity:0,phase:phase2,periapsisAngle:0,period:p2}};
  return body;
 });
 const reference={...world,bodies};
 const opportunity:TransferOpportunity={originId:origin.id,targetId:target.id,departureS:0,arrivalS:duration,
  transferTimeS:duration,heliocentricDeltaVMs:0,phaseErrorRad:Math.abs(offset),approximate:true};
 return {reference,opportunity,targetId:target.id};
}

describe('reference heliocentric encounter versus miss',()=>{
 it('reaches the destination in an exactly phased circular Hohmann reference',()=>{
  const {reference,opportunity,targetId}=circularReference(0);
  const encounter=evaluateInterplanetaryEncounter(reference,createInterplanetaryTrajectory(reference,opportunity));
  const radius=reference.bodies.find(body=>body.id===targetId)!.radius;
  expect(encounter.closestDistanceM).toBeLessThan(radius);
  expect(encounter.withinTargetRadius).toBe(true);
  expect(encounter.closestTimeS).toBeGreaterThan(0);
  expect(encounter.relativeSpeedMs).toBeGreaterThan(0);
 });
 it('does not fabricate a flyby when the target orbital phase is wrong',()=>{
  const {reference,opportunity}=circularReference(.6);
  const encounter=evaluateInterplanetaryEncounter(reference,createInterplanetaryTrajectory(reference,opportunity));
  expect(encounter.closestDistanceM).toBeGreaterThan(1e9);
  expect(encounter.withinTargetRadius).toBe(false);
 });
});

import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planFlight,flightAt,flightResolutionTime} from '../src/simulation/spaceflight/flight';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {planApoapsisCircularization} from '../src/simulation/spaceflight/maneuvers';
import {analyzeTrajectory} from '../src/simulation/spaceflight/conics';

describe('finite apoapsis burn',()=>{
 it('preserves finite-duration field for new flights without imposing it on legacy plans',()=>{
  const world=generateWorld('orbiter-003');
  const planet=world.bodies.find(b=>b.kind==='planet')!;
  const plan=planFlight(world.seed,'mission-2',planet,1000,4);
  expect(plan.apoapsisBurnDurationS).toBe(60);
  const legacy={...plan,apoapsisBurnDurationS:undefined};
  const gravity=gravityForRadius(planet.radius);
  expect(flightResolutionTime(plan,gravity)).toBeGreaterThanOrEqual(flightResolutionTime(legacy,gravity));
  const end=flightAt(plan,gravity,plan.insertionEndS);
  expect(Number.isFinite(analyzeTrajectory(end.state,gravity).periapsisM)).toBe(true);
  const maneuver=planApoapsisCircularization(end.state,gravity,plan.objective!.periapsisAltitudeM,plan.insertion.ispS);
  if(maneuver&&!end.impacted){
   const start=flightAt(plan,gravity,maneuver.atS);
   const mid=flightAt(plan,gravity,maneuver.atS+30);
   const finish=flightAt(plan,gravity,maneuver.atS+60);
   expect(start.state.fuelKg).toBeGreaterThanOrEqual(mid.state.fuelKg);
   expect(mid.state.fuelKg).toBeGreaterThanOrEqual(finish.state.fuelKg);
   expect(mid.state.timeS).toBeGreaterThan(start.state.timeS);
   expect(finish.state.timeS).toBeGreaterThan(mid.state.timeS);
  }
 });
});

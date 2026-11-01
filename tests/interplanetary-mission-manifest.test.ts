import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {prepareInterplanetaryMission} from '../src/simulation/interplanetary-mission-manifest';

describe('physical interplanetary mission manifest',()=>{
 const world=generateWorld('phase-five-injection');
 const [origin,target]=world.bodies.filter(body=>body.kind==='planet');
 const standard=designVehicle(gravityForRadius(origin.radius),4,3000,.5);
 const vehicle={...standard,ispS:1e7};
 it('produces ordered real milestones and a nonimpacting flyby outcome',()=>{
  const mission=prepareInterplanetaryMission(world,origin.id,target.id,1e6,5e6,vehicle);
  expect(mission).not.toBeNull();
  expect(mission!.outcome).toBe('flyby');
  expect(mission!.closestAltitudeM).toBeGreaterThan(0);
  expect(mission!.closestDistanceM).toBeLessThan(target.radius*10);
  expect(mission!.courseCorrectionFuelKg).toBeGreaterThan(0);
  expect(mission!.remainingFuelKg).toBeGreaterThanOrEqual(0);
  expect(mission!.milestones.map(event=>event.kind)).toEqual([
   'departure','course-correction','closest-approach','arrival',
  ]);
  expect(mission!.milestones.every((event,index,list)=>
   index===0||list[index-1].timeS<=event.timeS)).toBe(true);
  expect(mission).toEqual(prepareInterplanetaryMission(world,origin.id,target.id,1e6,5e6,vehicle));
 });
 it('does not create imaginary launches without propellant',()=>{
  expect(prepareInterplanetaryMission(world,origin.id,target.id,1e6,5e6,
   {...standard,fuelKg:0})).toBeNull();
 });
});

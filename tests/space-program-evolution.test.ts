import {describe,expect,it} from 'vitest';
import {homeLaunchSite,sitePosition} from '../src/simulation/spaceflight/surface-site';
import {planMissionObjective} from '../src/simulation/spaceflight/objectives';
import {generateWorld} from '../src/simulation/world';
import {createCivilization,advanceCivilization} from '../src/simulation/civilization';
describe('space program evolution contracts',()=>{
 it('anchors every new flight to the same site within its homeworld',()=>{
  const world=generateWorld('orbiter-001'),c=createCivilization(world),home=world.bodies.find(b=>b.id===c.homeId)!;
  const expected=sitePosition(homeLaunchSite(world.seed,home.id),home.radius);
  advanceCivilization(c,world,2000000,10000);
  const plans=c.missions.flatMap(m=>m.flight?[m.flight]:[]);
  expect(plans.length).toBeGreaterThan(1);
  for(const flight of plans)expect(flight.initial.position).toEqual(expected);
 });
 it('plans differentiated targets deterministically',()=>{
  const a=planMissionObjective('orbiter-001','mission-1',6371000,1000,4);
  expect(a).toEqual(planMissionObjective('orbiter-001','mission-1',6371000,1000,4));
  const objectives=new Set(Array.from({length:36},(_,i)=>planMissionObjective('orbiter-001','mission-'+(i+1),6371000,1000,4).objective));
  expect(objectives.size).toBeGreaterThanOrEqual(3);
 });
});

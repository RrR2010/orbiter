import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization,advanceCivilization} from '../src/simulation/civilization';
import {missionSymbols} from '../src/rendering/mission-symbols';
import {positionsAt} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {sampleAutonomousFlightWithPlanet} from '../src/simulation/spaceflight/flight-v2';

describe('launch and transfer labels',()=>{
 it('starts a physical launch at its surface site and switches to coast without inventing a new launch',()=>{
  const world=generateWorld('orbiter-002'),civilization=createCivilization(world);
  let count=0;
  while(!civilization.missions.some(m=>m.status==='ascending')&&count++<5000)advanceCivilization(civilization,world,civilization.nextAt,1);
  const mission=civilization.missions.find(m=>m.status==='ascending')!;
  expect(mission?.flight).toBeDefined();
  if(!mission?.flight)return;
  const planet=world.bodies.find(b=>b.id===civilization.homeId)!;
  const gravity=gravityForRadius(planet.radius),start=mission.flight.plan.ignitionS;
  const origin=sampleAutonomousFlightWithPlanet(mission.flight,gravity,start).position;
  expect(Math.hypot(origin.x,origin.y)).toBeCloseTo(planet.radius+10,4);
  const symbol=missionSymbols(world,civilization,start).find(s=>s.mission.id===mission.id)!;
  const home=positionsAt(world,start).get(civilization.homeId)!;
  expect(Math.hypot(symbol.position.x-home.x-origin.x,symbol.position.y-home.y-origin.y)).toBeLessThan(.001);
  expect(mission.flight.checkpoints.length).toBeGreaterThan(0);
 });
});

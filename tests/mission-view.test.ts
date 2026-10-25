import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization,advanceCivilization} from '../src/simulation/civilization';
import {missionSymbols} from '../src/rendering/mission-symbols';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {sampleAutonomousFlightWithPlanet} from '../src/simulation/spaceflight/flight-v2';
import {positionsAt} from '../src/simulation/world';

describe('physical mission view',()=>{
 it('renders physical flight coordinates without modifying simulation state',()=>{
  const world=generateWorld('physical-view'),civilization=createCivilization(world);
  advanceCivilization(civilization,world,300000,10000);
  const mission=civilization.missions.find(m=>m.flight);
  expect(mission).toBeDefined();
  if(!mission?.flight)return;
  const snapshot=JSON.stringify(civilization),time=mission.flight.plan.ignitionS+30;
  const symbols=missionSymbols(world,civilization,time),symbol=symbols.find(s=>s.mission.id===mission.id);
  // Historical failures are not drawn as still-active vehicles.
  if(mission.status==='success'){
   expect(symbol?.physical).toBe(true);
   const center=positionsAt(world,time).get(civilization.homeId)!;
   expect(Math.hypot(symbol!.position.x-center.x,symbol!.position.y-center.y)).toBeGreaterThan(0);
  }
  expect(JSON.stringify(civilization)).toBe(snapshot);
  const planet=world.bodies.find(b=>b.id===civilization.homeId)!;
  const physics=sampleAutonomousFlightWithPlanet(mission.flight,gravityForRadius(planet.radius),mission.flight.plan.ignitionS+30);
  expect(Number.isFinite(physics.position.x)).toBe(true);
 });
});

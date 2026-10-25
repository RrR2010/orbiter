import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization,advanceCivilization} from '../src/simulation/civilization';
import {flightViewAt} from '../src/rendering/flight-view';
describe('flight projection view',()=>{
 it('samples deterministic states without mutating mission or burn plan',()=>{
  const world=generateWorld('flight-projection'),c=createCivilization(world);
  advanceCivilization(c,world,300000,10000);
  const mission=c.missions.find(m=>m.flight);
  expect(mission?.flight).toBeDefined();if(!mission?.flight)return;
  const radius=world.bodies.find(b=>b.id===mission.originId)!.radius;
  const before=JSON.stringify(mission);
  const first=flightViewAt(mission,radius,mission.flight.plan.ignitionS+22.5);
  const second=flightViewAt(mission,radius,mission.flight.plan.ignitionS+22.5);
  expect(first).toEqual(second);
  expect(JSON.stringify(mission)).toBe(before);
 });
});

import {describe,it,expect} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization,advanceCivilization} from '../src/simulation/civilization';
describe('launch watch event gate',()=>{
 it('stops at preparation even when advancing far into the future',()=>{
  const world=generateWorld('watch-regression');
  const watched=createCivilization(world),unwatched=createCivilization(world);
  const events=advanceCivilization(watched,world,2e6,10000,true);
  expect(events).toBeGreaterThan(0);
  expect(watched.events.at(-1)?.kind).toBe('preparation');
  expect(watched.missions.at(-1)?.status).toBe('preparing');
  expect(watched.time).toBe(watched.missions.at(-1)?.startedAt);
  expect(watched.time).toBeLessThan(2e6);
  advanceCivilization(unwatched,world,watched.time,10000);
  expect(watched).toEqual(unwatched);
  advanceCivilization(watched,world,2e6,10000);
  advanceCivilization(unwatched,world,2e6,10000);
  expect(watched).toEqual(unwatched);
 });
 it('does not stop for research while watching preparation',()=>{
  const world=generateWorld('watch-research');
  const watched=createCivilization(world);
  advanceCivilization(watched,world,900,10000,true);
  expect(watched.events.at(-1)?.kind).toBe('research');
  expect(watched.time).toBe(900);
 });
});

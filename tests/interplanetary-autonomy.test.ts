import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization,serializeCivilization} from '../src/simulation/civilization';
import {authorizeInterplanetaryLaunch} from '../src/simulation/interplanetary-autonomy';

describe('autonomous interplanetary launch authorization',()=>{
 const world=generateWorld('phase-five-injection');
 it('does not finance a mission before technology and resources are available',()=>{
  const c=createCivilization(world);
  const original=serializeCivilization(c);
  expect(authorizeInterplanetaryLaunch(c,world)).toBeNull();
  expect(serializeCivilization(c)).toBe(original);
  c.stage=4;c.resources=0;
  const withoutFunds=serializeCivilization(c);
  expect(authorizeInterplanetaryLaunch(c,world)).toBeNull();
  expect(serializeCivilization(c)).toBe(withoutFunds);
 });
 it('never charges the civilization for an unavailable physical flight',()=>{
  const c=createCivilization(world);
  c.stage=4;c.resources=300;
  const original=serializeCivilization(c);
  const timeline=authorizeInterplanetaryLaunch(c,world);
  if(!timeline){
   expect(serializeCivilization(c)).toBe(original);
   return;
  }
  expect(timeline.manifest.outcome).toBe('flyby');
  expect(timeline.manifest.departureS).toBeGreaterThan(c.time);
  expect(c.resources).toBe(230);
  expect(c.interplanetaryTimelines).toContainEqual(timeline);
  const after=serializeCivilization(c);
  expect(authorizeInterplanetaryLaunch(c,world)).toBeNull();
  expect(serializeCivilization(c)).toBe(after);
 });
});

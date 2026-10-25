import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {SAVE_KEY,parseSave,serializeSave} from '../src/persistence/save';
import {createCivilization,advanceCivilization,parseCivilization,serializeCivilization} from '../src/simulation/civilization';

describe('V2 clean reset and persistence',()=>{
 it('uses new namespace and rejects legacy world saves',()=>{
  expect(SAVE_KEY).toBe('orbiter.world.v2');
  expect(parseSave(JSON.stringify({version:1,seed:'old',time:100,warp:100,camera:{x:0,y:0,zoom:1}}))).toBeNull();
  const v2={version:2 as const,seed:'new',time:100,warp:100 as const,camera:{x:0,y:0,zoom:1}};
  expect(parseSave(serializeSave(v2))).toEqual(v2);
 });
 it('rejects v1 civilization and retains V2 resolved checkpoints after serialization',()=>{
  const world=generateWorld('v2-save-reset');
  const c=createCivilization(world);
  expect(c.version).toBe(2);
  expect(parseCivilization(JSON.stringify({...c,version:1}),world,0).version).toBe(2);
  advanceCivilization(c,world,700000,10000);
  const v2=c.missions.find(m=>m.flight?.version===2);
  expect(v2?.flight?.checkpoints.length).toBeGreaterThan(0);
  const restored=parseCivilization(serializeCivilization(c),world,c.time);
  expect(restored).toEqual(c);
  expect(restored.missions.find(m=>m.id===v2?.id)?.flight).toEqual(v2?.flight);
 });
});

import {describe,expect,it} from 'vitest';
import {createCivilization,parseCivilization,serializeCivilization} from '../src/simulation/civilization';
import {generateWorld} from '../src/simulation/world';
import {enqueueScience} from '../src/simulation/interplanetary-science-inbox';

describe('strategic persistence of pending scientific signals',()=>{
 const world=generateWorld('science-save-checkpoint');
 const make=()=>{
  const c=createCivilization(world);
  const target=world.bodies.find(b=>b.kind==='planet'&&b.id!==c.homeId)!;
  const observation={bodyId:target.id,observationId:'probe-one:gravity',measuredGravity:9.2,relativeError:.1,transmitted:true};
  c.scienceInbox=enqueueScience(c.scienceInbox!,{observation,transmission:{
   originId:c.homeId,targetId:target.id,observationAtS:1,receivedAtS:100,
   signalTravelS:99,distanceM:99*299792458,
  }});
  return c;
 };
 it('roundtrips a future signal without giving premature knowledge',()=>{
  const c=make(),saved=serializeCivilization(c);
  const restored=parseCivilization(saved,world,0);
  expect(restored.scienceInbox).toEqual(c.scienceInbox);
  expect(restored.science).toEqual(c.science);
  expect(restored.science!.knowledge[c.scienceInbox!.pending[0].observation.bodyId].gravity.observations).toBe(0);
 });
 it('migrates a legacy V2 save lacking the inbox',()=>{
  const c=createCivilization(world);
  const legacy=JSON.parse(serializeCivilization(c)) as Record<string,unknown>;
  delete legacy.scienceInbox;
  expect(parseCivilization(JSON.stringify(legacy),world,0).scienceInbox).toEqual({pending:[]});
 });
 it('rejects malformed or mismatched inbox records',()=>{
  const c=make(),saved=JSON.parse(serializeCivilization(c)) as Record<string,unknown>;
  const queue=saved.scienceInbox as {pending:Array<{transmission:{originId:string}}>} ;
  queue.pending[0].transmission.originId='unknown-home';
  const restored=parseCivilization(JSON.stringify(saved),world,0);
  expect(restored.scienceInbox).toEqual({pending:[]});
  expect(restored.missionSerial).toBe(0);
 });
});

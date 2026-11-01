import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {advanceCivilization,createCivilization,parseCivilization,serializeCivilization} from '../src/simulation/civilization';

describe('autonomous flyby science delivery',()=>{
 const world=generateWorld('phase-five-real-vehicle');
 const setup=()=>{
  const c=createCivilization(world);
  c.stage=4;c.knowledge=3000;c.resources=300;c.nextAt=1;
  c.missions.push({id:'completed-local-flight',originId:c.homeId,targetId:c.homeId,
   startedAt:0,launchAt:0,resolvedAt:0,status:'success',success:true,vehicleId:'historical-local'});
  advanceCivilization(c,world,1);
  return c;
 };
 it('does not grant measurements before their light-time reception',()=>{
  const c=setup(),timeline=c.interplanetaryTimelines![0],manifest=timeline.manifest;
  const encounter=manifest.milestones.find(event=>event.kind==='closest-approach')!.timeS;
  const target=manifest.targetId;
  const before=c.science!.knowledge[target].gravity.observations;
  advanceCivilization(c,world,encounter,10000);
  expect(c.science!.knowledge[target].gravity.observations).toBe(before);
  const item=c.scienceInbox!.pending.find(p=>p.observation.observationId===timeline.missionId+':gravity:'+target);
  expect(item).toBeDefined();
  expect(item!.transmission.receivedAtS).toBeGreaterThan(encounter);
  const restored=parseCivilization(serializeCivilization(c),world,c.time);
  advanceCivilization(restored,world,item!.transmission.receivedAtS,10000);
  expect(restored.science!.knowledge[target].gravity.observations).toBe(before+1);
  expect(restored.science!.receivedIds).toContain(item!.observation.observationId);
  expect(restored.scienceInbox!.pending).not.toContainEqual(item);
 });
 it('matches science state under a single warp and segmented save/load',()=>{
  const single=setup(),split=setup();
  const end=single.interplanetaryTimelines![0].manifest.arrivalS+86400;
  advanceCivilization(single,world,end,10000);
  const encounter=split.interplanetaryTimelines![0].manifest.milestones.find(m=>m.kind==='closest-approach')!.timeS;
  advanceCivilization(split,world,encounter,10000);
  const restored=parseCivilization(serializeCivilization(split),world,split.time);
  advanceCivilization(restored,world,end,10000);
  expect(restored.science).toEqual(single.science);
  expect(restored.scienceInbox).toEqual(single.scienceInbox);
 });
});

import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {advanceCivilization,createCivilization} from '../src/simulation/civilization';
import {interplanetaryProbeSymbols} from '../src/rendering/interplanetary-probe-symbols';
import {pickMission} from '../src/rendering/pick-mission';
import {projectPoint} from '../src/rendering/camera';

describe('interplanetary probe map selection',()=>{
 it('hits the actual projected probe without selecting future launches',()=>{
  const world=generateWorld('phase-five-real-vehicle');
  const c=createCivilization(world);
  c.stage=4;c.knowledge=3000;c.resources=300;c.nextAt=1;
  c.missions.push({id:'completed-local-flight',originId:c.homeId,targetId:c.homeId,
   startedAt:0,launchAt:0,resolvedAt:0,status:'success',success:true,vehicleId:'historical-local'});
  advanceCivilization(c,world,1);
  const manifest=c.interplanetaryTimelines![0].manifest;
  const camera={x:0,y:0,zoom:1};
  expect(interplanetaryProbeSymbols(c,1)).toEqual([]);
  const time=manifest.correctedCoastStart.timeS;
  advanceCivilization(c,world,time,10000);
  const probe=interplanetaryProbeSymbols(c,time)[0];
  expect(probe).toBeDefined();
  const point=projectPoint(probe.position,camera,1200,800);
  expect(pickMission(world,c,time,camera,1200,800,point.x,point.y)).toBe(probe.missionId);
 });
});

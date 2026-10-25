import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createAutonomousFlightV2,resolveAutonomousFlightV2} from '../src/simulation/spaceflight/flight-v2';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {flightViewAt} from '../src/rendering/flight-view';
import {missionSymbols} from '../src/rendering/mission-symbols';
import {createCivilization,type Mission} from '../src/simulation/civilization';

describe('suborbital vehicle lifecycle',()=>{
 it('records surface impact and never shows a completed suborbital craft inside its planet',()=>{
  const world=generateWorld('suborbital-impact-check');
  const planet=world.bodies.find(b=>b.kind==='planet')!;
  const gravity=gravityForRadius(planet.radius);
  let plan=createAutonomousFlightV2(world.seed,'mission-1',planet,1000,4,50000);
  for(let i=2;i<60&&plan.target.objective!=='suborbitalSurvey';i++){
   plan=createAutonomousFlightV2(world.seed,'mission-'+i,planet,1000,4,50000);
  }
  expect(plan.target.objective).toBe('suborbitalSurvey');
  const result=resolveAutonomousFlightV2(plan,gravity);
  expect(result.orbital).toBe(false);
  const mission:Mission={id:plan.id,originId:planet.id,targetId:planet.id,startedAt:0,launchAt:1000,resolvedAt:result.terminal.timeS,status:result.goalAchieved?'success':'failure',success:result.goalAchieved,vehicleId:'test',flight:result};
  const impact=result.checkpoints.find(c=>c.kind==='impact');
  if(impact){
   expect(flightViewAt(mission,planet.radius,impact.timeS+1)).toBeNull();
   const civilization=createCivilization(world);
   civilization.homeId=planet.id;
   civilization.missions=[mission];
   mission.status='success';
   expect(missionSymbols(world,civilization,impact.timeS+1)).toHaveLength(0);
  }
  if(result.goalAchieved)expect(result.outcome).toBe('achieved');
 });
});

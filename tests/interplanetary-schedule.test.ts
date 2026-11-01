import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization} from '../src/simulation/civilization';
import {proposeInterplanetaryLaunch,INTERPLANETARY_PREPARATION_S,INTERPLANETARY_MIN_LEAD_S} from '../src/simulation/interplanetary-schedule';

describe('interplanetary scheduling proposal',()=>{
 const world=generateWorld('phase-five-schedule');
 it('does not propose a launch before the technology threshold',()=>{
  const c=createCivilization(world);
  expect(proposeInterplanetaryLaunch(c,world,0)).toBeNull();
 });
 it('keeps scheduling pure, bounded and future-looking',()=>{
  const c=createCivilization(world);
  c.stage=4;c.knowledge=10000;c.resources=300;
  const snapshot=JSON.stringify(c);
  const first=proposeInterplanetaryLaunch(c,world,1e6);
  expect(first).toEqual(proposeInterplanetaryLaunch(c,world,1e6));
  expect(JSON.stringify(c)).toBe(snapshot);
  if(first){
   expect(first.launchAtS).toBeGreaterThanOrEqual(1e6+INTERPLANETARY_PREPARATION_S+INTERPLANETARY_MIN_LEAD_S);
   expect(first.preparedAtS).toBe(first.launchAtS-INTERPLANETARY_PREPARATION_S);
   expect(first.arrivalAtS).toBeGreaterThan(first.launchAtS);
   expect(first.candidate.budget.feasible).toBe(true);
  }
 });
 it('never proposes a second launch with an active legacy mission',()=>{
  const c=createCivilization(world);
  c.stage=4;c.knowledge=10000;c.resources=300;
  c.missions.push({id:'mission-1',originId:c.homeId,targetId:c.homeId,startedAt:1,launchAt:1201,resolvedAt:0,status:'preparing',success:null,vehicleId:'vehicle-1'});
  expect(proposeInterplanetaryLaunch(c,world,1e6)).toBeNull();
 });
 it('rejects invalid proposal times',()=>{
  expect(()=>proposeInterplanetaryLaunch(createCivilization(world),world,-1)).toThrow();
 });
});

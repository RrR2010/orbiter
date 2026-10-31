import type {Civilization} from './civilization';
import {registerInterplanetaryTimeline,LAUNCH_RESOURCE_COST} from './civilization';
import {createMissionTimeline,type MissionTimeline} from './interplanetary-mission-timeline';
import {prepareInterplanetaryMission} from './interplanetary-mission-manifest';
import {proposeInterplanetaryLaunch} from './interplanetary-schedule';
import {designVehicle} from './spaceflight/vehicle-capability';
import {gravityForRadius} from './spaceflight/gravity';
import type {World} from './world';

/** Authorize an autonomous interplanetary launch only after proving its actual
 * vehicle can pay for the full patched-conic escape and correction.
 * Infeasible proposals leave the civilization completely unchanged.
 */
export function authorizeInterplanetaryLaunch(c:Civilization,world:World):MissionTimeline|null{
 if(c.stage<4||c.resources<LAUNCH_RESOURCE_COST||
  c.interplanetaryTimelines?.some(t=>t.cursor<t.manifest.milestones.length))return null;
 const intent=proposeInterplanetaryLaunch(c,world,c.time);
 if(!intent)return null;
 const home=world.bodies.find(b=>b.id===c.homeId);
 if(!home||home.kind!=='planet')return null;
 const vehicle=designVehicle(gravityForRadius(home.radius),c.stage,c.knowledge,.5);
 const {originId,targetId,departureS,arrivalS}=intent.candidate.opportunity;
 // Do not promote ideal Hohmann budgeting into a real mission: physically
 // propagate the proposed rocket before charging or recording anything.
 const manifest=prepareInterplanetaryMission(
  world,originId,targetId,departureS,arrivalS,vehicle);
 if(!manifest||manifest.outcome!=='flyby')return null;
 const id='interplanetary-'+(c.missionSerial+1);
 const timeline=createMissionTimeline(id,manifest);
 registerInterplanetaryTimeline(c,timeline);
 c.missionSerial++;
 c.resources=Math.round((c.resources-LAUNCH_RESOURCE_COST)*1e6)/1e6;
 return timeline;
}

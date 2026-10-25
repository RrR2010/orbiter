import {planFlight,flightAt,flightSucceeded,type FlightPlan} from './spaceflight/flight';
import {gravityForRadius} from './spaceflight/gravity';
import {seededRandom} from '../core/random';
import type {World} from './world';

export type Technology='astronomy'|'rocketry'|'orbitalFlight'|'satellites';
export type MissionStatus='preparing'|'ascending'|'success'|'failure';
export type Mission={id:string;originId:string;targetId:string;startedAt:number;launchAt:number;resolvedAt:number;status:MissionStatus;success:boolean|null;vehicleId:string;flight?:FlightPlan};
export type SpaceEvent={id:string;time:number;kind:'research'|'preparation'|'launch'|'success'|'failure';missionId:string|null;detail:string};
export type Civilization={version:1;id:string;homeId:string;seed:string;time:number;accruedAt:number;stage:number;knowledge:number;resources:number;nextAt:number;missionSerial:number;missions:Mission[];events:SpaceEvent[];successes:number;failures:number};
const TECH:readonly Technology[]=['astronomy','rocketry','orbitalFlight','satellites'];
const RESEARCH_COST=[30,60,100,150];
const RESEARCH_SECONDS=[900,1800,3600,7200];
const LAUNCH_COST=45,PREP_SECONDS=1200,FLIGHT_SECONDS=300,RECOVERY_SECONDS=172800,MAX_MISSIONS=60,MAX_EVENTS=120;
const round=(v:number):number=>Math.round(v*1e6)/1e6;
function accrue(c:Civilization,until:number):void{const minutes=Math.floor(until/60)-Math.floor(c.accruedAt/60);if(minutes>0){c.resources=round(Math.min(300,c.resources+minutes*.65));c.knowledge=round(c.knowledge+minutes*.45);}c.accruedAt=until;}
const probability=(seed:string,id:string):number=>seededRandom('orbiter:mission:v1:'+seed+':'+id)();

/** Initialize at the current simulation time; never fabricate historical launches. */
export function createCivilization(world:World,time=0):Civilization{
 const planets=world.bodies.filter(b=>b.kind==='planet');
 const home=planets[Math.floor(probability(world.seed,'home')*planets.length)];
 if(!home||!Number.isFinite(time)||time<0)throw new Error('Invalid civilization origin');
 return {version:1,id:'civilization-0',homeId:home.id,seed:world.seed,time,accruedAt:time,stage:0,knowledge:0,resources:80,nextAt:time+RESEARCH_SECONDS[0],missionSerial:0,missions:[],events:[],successes:0,failures:0};
}
function record(c:Civilization,time:number,kind:SpaceEvent['kind'],detail:string,missionId:string|null=null):void{
 c.events.push({id:'event-'+time+'-'+kind+'-'+c.missionSerial,time,kind,detail,missionId});
 if(c.events.length>MAX_EVENTS)c.events.splice(0,c.events.length-MAX_EVENTS);
}
export function technology(c:Readonly<Civilization>):readonly Technology[]{return TECH.slice(0,c.stage);}
/** Event-driven integration. The exact same event order is processed for any time partition. */
export function advanceCivilization(c:Civilization,world:World,target:number,budget=256):number{
 if(!Number.isFinite(target)||target<c.time)throw new Error('Invalid target time');
 if(!Number.isSafeInteger(budget)||budget<1)throw new Error('Invalid event budget');
 let processed=0;
 while(c.nextAt<=target&&processed<budget){
  const time=c.nextAt;processed++;
  // Accrue resources and knowledge at deterministic event boundaries.
  accrue(c,time);
  c.time=time;
  const mission=c.missions.find(m=>m.status==='preparing'||m.status==='ascending');
  if(mission?.status==='preparing'){
   const home=world.bodies.find(b=>b.id===mission.originId);
   if(!mission.flight&&home)mission.flight=planFlight(world.seed,mission.id,home,time,c.stage);
   mission.status='ascending';record(c,time,'launch','Launch ignition',mission.id);c.nextAt=time+FLIGHT_SECONDS;
  }else if(mission?.status==='ascending'){
   const home=world.bodies.find(b=>b.id===mission.originId);
   const planet=home?gravityForRadius(home.radius):null;
   mission.success=mission.flight&&planet?flightSucceeded(flightAt(mission.flight,planet,time),planet):probability(world.seed,mission.id)<Math.min(.94,.35+c.stage*.12+Math.min(.2,c.successes*.035));
   mission.status=mission.success?'success':'failure';mission.resolvedAt=time;
   if(mission.success)c.successes++;else c.failures++;
   record(c,time,mission.success?'success':'failure',mission.success?'Satellite reached operational orbit':'Launch ended without a stable orbit',mission.id);
   c.nextAt=time+RECOVERY_SECONDS;
  }else if(c.stage<TECH.length){
   const cost=RESEARCH_COST[c.stage];
   if(c.knowledge>=cost){
    c.knowledge=round(c.knowledge-cost);c.stage++;
    record(c,time,'research','Technology unlocked: '+TECH[c.stage-1]);
    c.nextAt=time+(RESEARCH_SECONDS[c.stage]??RECOVERY_SECONDS);
   }else c.nextAt=time+RESEARCH_SECONDS[c.stage];
  }else if(c.resources>=LAUNCH_COST){
   c.resources=round(c.resources-LAUNCH_COST);
   const id='mission-'+(++c.missionSerial);
   c.missions.push({id,originId:c.homeId,targetId:c.homeId,startedAt:time,launchAt:time+PREP_SECONDS,resolvedAt:0,status:'preparing',success:null,vehicleId:'vehicle-'+c.missionSerial});
   if(c.missions.length>MAX_MISSIONS)c.missions.shift();
   record(c,time,'preparation','Orbital mission preparation initiated',id);c.nextAt=time+PREP_SECONDS;
  }else c.nextAt=time+RECOVERY_SECONDS;
 }
 // Work cap never discards simulation debt; caller must resume before drawing an advanced timeline.
 if(c.nextAt>target){
  accrue(c,target);
  c.time=target;
 }
 return processed;
}
export function serializeCivilization(c:Civilization):string{return JSON.stringify(c);}
/** Fail closed on corrupted strategic records; preserve older astronomical saves separately. */
export function parseCivilization(raw:string|null,world:World,time:number):Civilization{
 if(!raw)return createCivilization(world,time);
 try{
  const c:unknown=JSON.parse(raw);if(!c||typeof c!=='object')throw Error();
  const v=c as Civilization;
  if(v.version!==1||v.id!=='civilization-0'||v.seed!==world.seed||!world.bodies.some(b=>b.id===v.homeId&&b.kind==='planet')||
   ![v.time,v.accruedAt,v.nextAt,v.resources,v.knowledge,v.stage,v.missionSerial,v.successes,v.failures].every(Number.isFinite)||
   v.stage<0||v.stage>TECH.length||v.time<0||v.accruedAt!==v.time||v.nextAt<=v.time||v.missionSerial<0||!Number.isSafeInteger(v.stage)||!Number.isSafeInteger(v.missionSerial)||
   !Array.isArray(v.events)||!Array.isArray(v.missions)||v.events.length>MAX_EVENTS||v.missions.length>MAX_MISSIONS||
   v.missions.some(m=>!m.id||!['preparing','ascending','success','failure'].includes(m.status)))throw Error();
  // Astronomy is authoritative; a future strategic save must not rewind orbital time.
  if(v.time>time)throw Error();
  return v;
 }catch{return createCivilization(world,time);}
}

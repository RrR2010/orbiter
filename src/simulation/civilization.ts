import {createAutonomousFlightV2,resolveAutonomousFlightV2,type AutonomousFlightResultV2} from './spaceflight/flight-v2';
import {gravityForRadius} from './spaceflight/gravity';
import {seededRandom} from '../core/random';
import {initialScientificRecord,type ScientificRecord} from './scientific-knowledge';
import type {World} from './world';
import {advanceMissionTimeline,parseMissionTimeline,type MissionTimeline} from './interplanetary-mission-timeline';
import {MAX_PENDING_SCIENCE,drainScience,type ScienceInbox} from './interplanetary-science-inbox';

export type Technology='astronomy'|'rocketry'|'orbitalFlight'|'satellites';
export type MissionStatus='preparing'|'ascending'|'success'|'failure';
export type Mission={id:string;originId:string;targetId:string;startedAt:number;launchAt:number;resolvedAt:number;status:MissionStatus;success:boolean|null;vehicleId:string;flight?:AutonomousFlightResultV2};
export type SpaceEvent={id:string;time:number;kind:'research'|'preparation'|'launch'|'success'|'failure';missionId:string|null;detail:string};
export type Civilization={version:2;id:string;homeId:string;seed:string;time:number;accruedAt:number;stage:number;knowledge:number;resources:number;nextAt:number;missionSerial:number;missions:Mission[];events:SpaceEvent[];successes:number;failures:number;science?:ScientificRecord;scienceInbox?:ScienceInbox;interplanetaryTimelines?:MissionTimeline[]};
const TECH:readonly Technology[]=['astronomy','rocketry','orbitalFlight','satellites'];
const RESEARCH_COST=[30,60,100,150];
const RESEARCH_SECONDS=[900,1800,3600,7200];
export const RESOURCE_CAP=300,RESOURCE_INCOME_PER_DAY=18,LAUNCH_RESOURCE_COST=70;
const PREP_SECONDS=1200,RECOVERY_SECONDS=172800,MAX_MISSIONS=60,MAX_EVENTS=120;
const round=(v:number):number=>Math.round(v*1e6)/1e6;
function accrue(c:Civilization,until:number):void{const minutes=Math.floor(until/60)-Math.floor(c.accruedAt/60);if(minutes>0){c.resources=round(Math.min(RESOURCE_CAP,c.resources+minutes*RESOURCE_INCOME_PER_DAY/1440));c.knowledge=round(c.knowledge+minutes*.45);}c.accruedAt=until;}
const probability=(seed:string,id:string):number=>seededRandom('orbiter:mission:v2:'+seed+':'+id)();

/** Initialize at the current simulation time; never fabricate historical launches. */
export function createCivilization(world:World,time=0):Civilization{
 const planets=world.bodies.filter(b=>b.kind==='planet');
 const home=planets[Math.floor(probability(world.seed,'home')*planets.length)];
 if(!home||!Number.isFinite(time)||time<0)throw new Error('Invalid civilization origin');
 return {version:2,id:'civilization-0',homeId:home.id,seed:world.seed,time,accruedAt:time,stage:0,knowledge:0,resources:80,nextAt:time+RESEARCH_SECONDS[0],missionSerial:0,missions:[],events:[],successes:0,failures:0,science:initialScientificRecord(world),scienceInbox:{pending:[]},interplanetaryTimelines:[]};
}
function record(c:Civilization,time:number,kind:SpaceEvent['kind'],detail:string,missionId:string|null=null):void{
 c.events.push({id:'event-'+time+'-'+kind+'-'+c.missionSerial,time,kind,detail,missionId});
 if(c.events.length>MAX_EVENTS)c.events.splice(0,c.events.length-MAX_EVENTS);
}
export function technology(c:Readonly<Civilization>):readonly Technology[]{return TECH.slice(0,c.stage);}
/** Register a physically prepared mission without emitting historical events. */
export function registerInterplanetaryTimeline(c:Civilization,timeline:MissionTimeline):void{
 const checked=parseMissionTimeline(JSON.stringify(timeline));
 if(checked.timeS<c.time||c.interplanetaryTimelines?.some(t=>t.missionId===checked.missionId))
  throw new Error('Invalid interplanetary mission registration');
 c.interplanetaryTimelines??=[];
 c.interplanetaryTimelines.push(checked);
}

/** Event-driven integration. The exact same event order is processed for any time partition. */
export function advanceCivilization(c:Civilization,world:World,target:number,budget=256,stopOnPreparation=false):number{
 if(!Number.isFinite(target)||target<c.time)throw new Error('Invalid target time');
 if(!Number.isSafeInteger(budget)||budget<1)throw new Error('Invalid event budget');
 let processed=0;
 const nextMilestone=():number=>Math.min(Infinity,...(c.interplanetaryTimelines??[]).map(t=>
  t.manifest.milestones[t.cursor]?.timeS??Infinity));
 while(Math.min(c.nextAt,c.scienceInbox?.pending[0]?.transmission.receivedAtS??Infinity,nextMilestone())<=target&&processed<budget){
  const reception=c.scienceInbox?.pending[0]?.transmission.receivedAtS;
  const time=Math.min(c.nextAt,reception===undefined?Infinity:Math.max(c.time,reception),nextMilestone());
  processed++;
  // Accrue resources and knowledge at deterministic event boundaries.
  accrue(c,time);
  c.time=time;
  // Receive signals before a simultaneous strategic event. This is replay-safe.
  if(c.scienceInbox?.pending.length&&c.science){
   const delivered=drainScience(c.scienceInbox,c.science,time);
   c.scienceInbox=delivered.inbox;c.science=delivered.record;
   for(const id of delivered.deliveredIds)record(c,time,'research','Scientific observation received: '+id);
  }
  for(const timeline of c.interplanetaryTimelines??[]){
   const result=advanceMissionTimeline(timeline,time);
   const index=c.interplanetaryTimelines!.indexOf(timeline);
   c.interplanetaryTimelines![index]=result.timeline;
   for(const milestone of result.emitted)
    record(c,milestone.timeS,milestone.kind==='course-correction'?'launch':
     milestone.kind==='closest-approach'?'success':'preparation',
     'Interplanetary '+milestone.kind+': '+milestone.detail,timeline.missionId);
  }
  if(time<c.nextAt)continue;
  const mission=c.missions.find(m=>m.status==='preparing'||m.status==='ascending');
  if(mission?.status==='preparing'){
   const home=world.bodies.find(b=>b.id===mission.originId);
   if(!home||home.kind!=='planet')throw new Error('Missing V2 launch planet');
   if(!mission.flight){
    const plan=createAutonomousFlightV2(world.seed,mission.id,home,time,c.stage,c.knowledge);
    mission.flight=resolveAutonomousFlightV2(plan,gravityForRadius(home.radius));
   }
   mission.status='ascending';
   record(c,time,'launch','V2 autonomous launch ignition',mission.id);
   c.nextAt=Math.max(time+1,mission.flight.terminal.timeS);
  }else if(mission?.status==='ascending'){
   mission.success=mission.flight?.goalAchieved||mission.flight?.orbital||false;
   mission.status=mission.success?'success':'failure';mission.resolvedAt=time;
   if(mission.success)c.successes++;else c.failures++;
   const detail=mission.flight?.reason??'Missing flight result';
   record(c,time,mission.success?'success':'failure',detail,mission.id);
   c.nextAt=time+RECOVERY_SECONDS;
  }else if(c.stage<TECH.length){
   const cost=RESEARCH_COST[c.stage];
   if(c.knowledge>=cost){
    c.knowledge=round(c.knowledge-cost);c.stage++;
    record(c,time,'research','Technology unlocked: '+TECH[c.stage-1]);
    c.nextAt=time+(RESEARCH_SECONDS[c.stage]??RECOVERY_SECONDS);
   }else c.nextAt=time+RESEARCH_SECONDS[c.stage];
  }else if(c.resources>=LAUNCH_RESOURCE_COST){
   c.resources=round(c.resources-LAUNCH_RESOURCE_COST);
   const id='mission-'+(++c.missionSerial);
   c.missions.push({id,originId:c.homeId,targetId:c.homeId,startedAt:time,launchAt:time+PREP_SECONDS,resolvedAt:0,status:'preparing',success:null,vehicleId:'vehicle-'+c.missionSerial});
   if(c.missions.length>MAX_MISSIONS)c.missions.shift();
   record(c,time,'preparation','Mission preparation initiated (resource cost '+LAUNCH_RESOURCE_COST+')',id);c.nextAt=time+PREP_SECONDS;if(stopOnPreparation)break;
  }else c.nextAt=time+RECOVERY_SECONDS;
 }
 // Work cap never discards simulation debt; caller must resume before drawing an advanced timeline.
 if(Math.min(c.nextAt,c.scienceInbox?.pending[0]?.transmission.receivedAtS??Infinity,nextMilestone())>target){
  accrue(c,target);
  c.time=target;
 }
 return processed;
}
export function serializeCivilization(c:Civilization):string{return JSON.stringify(c);}
/** V2 only. All legacy V1 strategic records are rejected. */
export function parseCivilization(raw:string|null,world:World,time:number):Civilization{
 if(!raw)return createCivilization(world,time);
 try{
  const c:unknown=JSON.parse(raw);if(!c||typeof c!=='object')throw Error();
  const v=c as Civilization;
  if(v.version!==2||v.id!=='civilization-0'||v.seed!==world.seed||!world.bodies.some(b=>b.id===v.homeId&&b.kind==='planet')||
   ![v.time,v.accruedAt,v.nextAt,v.resources,v.knowledge,v.stage,v.missionSerial,v.successes,v.failures].every(Number.isFinite)||
   v.stage<0||v.stage>TECH.length||v.time<0||v.accruedAt!==v.time||v.nextAt<=v.time||v.missionSerial<0||!Number.isSafeInteger(v.stage)||!Number.isSafeInteger(v.missionSerial)||
   !Array.isArray(v.events)||!Array.isArray(v.missions)||v.events.length>MAX_EVENTS||v.missions.length>MAX_MISSIONS||
   v.missions.some(m=>!m.id||!['preparing','ascending','success','failure'].includes(m.status)||m.flight?.version!==undefined&&m.flight.version!==2))throw Error();
  // Astronomy is authoritative; a future strategic save must not rewind orbital time.
  if(v.time>time)throw Error();
  // V2 saves predating scientific records gain only initial estimates; never retroactively grant observations.
  if(v.science===undefined){v.science=initialScientificRecord(world);}
  else if(!isValidScientificRecord(v.science,world))throw Error('Invalid scientific record');
  if(v.scienceInbox===undefined)v.scienceInbox={pending:[]};
  else if(!isValidScienceInbox(v.scienceInbox,world,v.homeId,v.science))throw Error('Invalid science inbox');
  if(v.interplanetaryTimelines===undefined)v.interplanetaryTimelines=[];
  if(!Array.isArray(v.interplanetaryTimelines)||v.interplanetaryTimelines.length>60)throw Error();
  v.interplanetaryTimelines=v.interplanetaryTimelines.map(t=>parseMissionTimeline(JSON.stringify(t)));
  if(new Set(v.interplanetaryTimelines.map(t=>t.missionId)).size!==v.interplanetaryTimelines.length||
   v.interplanetaryTimelines.some(t=>t.timeS>v.time))throw Error();
  return v;
 }catch{return createCivilization(world,time);}
}

/** Validate scientific save boundaries before returning untrusted persisted state. */
function isValidScientificRecord(value:unknown,world:World):value is ScientificRecord{
 if(!value||typeof value!=='object')return false;
 const record=value as Partial<ScientificRecord>;
 if(!record.knowledge||typeof record.knowledge!=='object'||Array.isArray(record.knowledge)||!Array.isArray(record.receivedIds)||record.receivedIds.length>10000)return false;
 if(record.receivedIds.some(id=>typeof id!=='string'||!id||id.length>160)||new Set(record.receivedIds).size!==record.receivedIds.length)return false;
 const planetIds=world.bodies.filter(body=>body.kind==='planet').map(body=>body.id);
 if(Object.keys(record.knowledge).length!==planetIds.length)return false;
 return planetIds.every(id=>{
  const entry=record.knowledge?.[id];
  const estimate=entry?.gravity;
  return entry?.bodyId===id&&!!estimate&&Number.isFinite(estimate.value)&&estimate.value>0&&Number.isFinite(estimate.uncertainty)&&estimate.uncertainty>0&&Number.isSafeInteger(estimate.observations)&&estimate.observations>=0;
 });
}

/** Refuse malformed or retroactively delivered inbox entries at the save boundary. */
function isValidScienceInbox(value:unknown,world:World,homeId:string,science:ScientificRecord):value is ScienceInbox{
 if(!value||typeof value!=='object'||!('pending' in value))return false;
 const pending=(value as ScienceInbox).pending;
 if(!Array.isArray(pending)||pending.length>MAX_PENDING_SCIENCE)return false;
 const ids=new Set<string>();
 let lastAt=-Infinity,lastId='';
 for(const entry of pending){
  if(!entry||typeof entry!=='object'||!entry.transmission||!entry.observation)return false;
  const t=entry.transmission,o=entry.observation;
  if(t.originId!==homeId||t.targetId!==o.bodyId||!world.bodies.some(b=>b.id===o.bodyId&&b.kind==='planet')||
   !Number.isFinite(t.observationAtS)||t.observationAtS<0||!Number.isFinite(t.receivedAtS)||t.receivedAtS<t.observationAtS||
   !Number.isFinite(t.distanceM)||t.distanceM<0||!Number.isFinite(t.signalTravelS)||t.signalTravelS<0||
   Math.abs(t.signalTravelS-(t.receivedAtS-t.observationAtS))>1e-5||
   typeof o.observationId!=='string'||!o.observationId||o.observationId.length>160||
   !Number.isFinite(o.measuredGravity)||o.measuredGravity<=0||!Number.isFinite(o.relativeError)||o.relativeError<=0||o.relativeError>1||
   typeof o.transmitted!=='boolean'||ids.has(o.observationId)||science.receivedIds.includes(o.observationId)||
   t.receivedAtS<lastAt||(t.receivedAtS===lastAt&&o.observationId.localeCompare(lastId)<0))return false;
  ids.add(o.observationId);lastAt=t.receivedAtS;lastId=o.observationId;
 }
 return true;
}

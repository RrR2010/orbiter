import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {advanceCivilization,createCivilization,parseCivilization,serializeCivilization} from '../src/simulation/civilization';
import {enqueueScience} from '../src/simulation/interplanetary-science-inbox';
import {interplanetaryOperationRecord,localOperationRecord,missionOperationRecords} from '../src/simulation/mission-operation-projection';
import {validateMissionOperationRecord} from '../src/simulation/mission-operations';

function completedLocal(){
 const world=generateWorld('flight-projection'),c=createCivilization(world);
 advanceCivilization(c,world,300000,10000);
 return {world,c,mission:c.missions.find(m=>m.flight)!};
}
function authorizedProbe(){
 const world=generateWorld('phase-five-real-vehicle'),c=createCivilization(world);
 c.stage=4;c.knowledge=3000;c.resources=300;c.nextAt=1;
 c.missions.push({id:'historical-success',originId:c.homeId,targetId:c.homeId,
  startedAt:0,launchAt:0,resolvedAt:0,status:'success',success:true,vehicleId:'legacy'});
 advanceCivilization(c,world,1);
 return {world,c,timeline:c.interplanetaryTimelines![0]};
}
describe('phase 9 M3 operational projections',()=>{
 it('adapts real local checkpoints to a causal, typed and immutable record',()=>{
  const {c,mission}=completedLocal(),before=serializeCivilization(c);
  const record=localOperationRecord(c,mission);
  expect(record.pipeline).toBe('local');
  if(mission.status==='success'||mission.status==='failure')expect(record.outcome).toMatchObject({kind:'local',physical:mission.flight!.outcome});
  else expect(record.outcome.kind).toBe('pending');
  expect(record.ownerId).toBe(c.id);
  expect(record.operations.some(op=>op.kind==='launch')).toBe(true);
  expect(record.checkpoints.length).toBe(mission.flight!.checkpoints.filter(cp=>cp.timeS<=c.time).length);
  expect(record.checkpoints.every(cp=>cp.state.frameId===`body:${mission.originId}`)).toBe(true);
  expect(record.checkpoints.map(cp=>cp.state.fuelKg)).toEqual(
   mission.flight!.checkpoints.filter(cp=>cp.timeS<=c.time).map(cp=>cp.state.fuelKg));
  expect(record.operations.every((op,i)=>op.sequence===i)).toBe(true);
  expect(record.events.every(e=>e.epochS<=c.time)).toBe(true);
  expect(localOperationRecord(c,mission)).toEqual(record);
  expect(serializeCivilization(c)).toBe(before);
  expect(()=>validateMissionOperationRecord({...record,events:[...record.events,...record.events]})).toThrow();
 });
 it('distinguishes scheduled preparation from a confirmed ignition',()=>{
  const world=generateWorld('m3-local-preparation'),c=createCivilization(world);
  c.stage=4;c.resources=300;c.nextAt=1;
  advanceCivilization(c,world,1,10000,true);
  const mission=c.missions[0],planned=localOperationRecord(c,mission);
  expect(planned.events.some(e=>e.kind==='preparation')).toBe(true);
  expect(planned.events.some(e=>e.kind==='ignition')).toBe(false);
  expect(planned.operations.find(op=>op.kind==='launch')?.status).toBe('planned');
  expect(planned.checkpoints).toEqual([]);
  expect(planned.outcome.kind).toBe('pending');
  advanceCivilization(c,world,mission.launchAt,10000);
  const launched=localOperationRecord(c,mission);
  expect(launched.events.some(e=>e.kind==='ignition')).toBe(true);
  expect(launched.operations.find(op=>op.kind==='launch')?.status).toBe('confirmed');
 });
 it('never confirms future probe milestones or reveals pre-correction burn costs',()=>{
  const {world,c,timeline}=authorizedProbe(),before=serializeCivilization(c);
  expect(timeline).toBeDefined();
  const scheduled=interplanetaryOperationRecord(c,timeline);
  expect(scheduled.pipeline).toBe('interplanetary');
  expect(scheduled.events).toEqual([]);
  expect(scheduled.outcome.kind).toBe('pending');
  expect(scheduled.checkpoints).toEqual([]);
  const correction=scheduled.operations.find(op=>op.kind==='correction')!;
  expect(correction.parameters).toMatchObject({kind:'correction',deltaVMs:null,fuelSpentKg:null});
  expect(correction.status).toBe('planned');
  const departure=timeline.manifest.departureS;
  advanceCivilization(c,world,departure,10000);
  const underway=interplanetaryOperationRecord(c,c.interplanetaryTimelines![0]);
  expect(underway.events.some(e=>e.kind==='departure')).toBe(true);
  expect(underway.events.some(e=>e.kind==='correction')).toBe(false);
  expect(underway.outcome.kind).toBe('pending');
  expect(underway.events.every(e=>e.epochS<=c.time)).toBe(true);
  expect(serializeCivilization(c)).not.toBe(before);
  const coast=timeline.manifest.correctedCoastStart.timeS;
  advanceCivilization(c,world,coast,10000);
  const corrected=interplanetaryOperationRecord(c,c.interplanetaryTimelines![0]);
  expect(corrected.events.some(e=>e.kind==='correction')).toBe(true);
  expect(corrected.checkpoints.some(cp=>cp.id.endsWith('/correction'))).toBe(true);
  expect(corrected.operations.find(op=>op.kind==='correction')?.parameters).toMatchObject({
   kind:'correction',deltaVMs:timeline.manifest.courseCorrectionDeltaVMs
  });
  expect(interplanetaryOperationRecord(c,c.interplanetaryTimelines![0])).toEqual(corrected);
 });
 it('does not turn a physical flyby into a failed encounter when radio fails',()=>{
  const {world,c,timeline}=authorizedProbe();
  const encounter=timeline.manifest.milestones.find(m=>m.kind==='closest-approach')!;
  advanceCivilization(c,world,encounter.timeS,10000);
  c.events.push({id:'test-radio-failure',time:encounter.timeS,kind:'failure',
   missionId:timeline.missionId,detail:'Interplanetary radio link out of range'});
  const projection=interplanetaryOperationRecord(c,c.interplanetaryTimelines![0]);
  const encounterOperation=projection.operations.find(op=>op.kind==='observation')!;
  const radioOperation=projection.operations.find(op=>op.kind==='transmit'&&op.status==='failed')!;
  expect(encounterOperation.status).toBe('confirmed');
  expect(projection.outcome).toEqual({kind:'interplanetary',resolvedAtS:encounter.timeS,result:timeline.manifest.outcome});
  expect(radioOperation.status).toBe('failed');
  expect(projection.events.some(e=>e.kind==='radio-failure'&&e.operationId===radioOperation.id)).toBe(true);
 });
 it('keeps identical projections under partitioning, small budgets and save/reload',()=>{
  const world=generateWorld('phase7-m0-scheduler'),target=2e6;
  const single=createCivilization(world),split=createCivilization(world),budgeted=createCivilization(world);
  advanceCivilization(single,world,target,10000);
  for(let t=100000;t<=target;t+=100000)advanceCivilization(split,world,t,10000);
  for(let t=100000;t<=target;t+=100000){
   let rounds=0;
   do{
    advanceCivilization(budgeted,world,t,1);
    if(++rounds>10000)throw new Error('Budget did not settle');
   }while(budgeted.time<t);
  }
  expect(serializeCivilization(split)).toBe(serializeCivilization(single));
  expect(serializeCivilization(budgeted)).toBe(serializeCivilization(single));
  const before=serializeCivilization(single),projection=missionOperationRecords(single);
  expect(missionOperationRecords(split)).toEqual(projection);
  expect(missionOperationRecords(budgeted)).toEqual(projection);
  expect(missionOperationRecords(parseCivilization(before,world,target))).toEqual(projection);
  expect(missionOperationRecords(single)).toEqual(projection);
  expect(serializeCivilization(single)).toBe(before);
 });
 it('keeps science unavailable until reception, including after reload and repeated projection',()=>{
  const {world,c,timeline}=authorizedProbe(),id=timeline.missionId,body=timeline.manifest.targetId;
  const observationId=`${id}:gravity:${body}`,at=timeline.manifest.arrivalS+100;
  const observation={bodyId:body,observationId,measuredGravity:9.2,relativeError:.1,transmitted:true};
  c.scienceInbox=enqueueScience(c.scienceInbox!,{observation,transmission:{
   originId:c.homeId,targetId:body,observationAtS:timeline.manifest.arrivalS,
   receivedAtS:at,signalTravelS:100,distanceM:100*299792458
  }});
  expect(interplanetaryOperationRecord(c,timeline).events.some(e=>e.kind==='science-received')).toBe(false);
  advanceCivilization(c,world,at-1,10000);
  expect(interplanetaryOperationRecord(c,c.interplanetaryTimelines![0]).events.some(e=>e.kind==='science-received')).toBe(false);
  advanceCivilization(c,world,at,10000);
  const events=interplanetaryOperationRecord(c,c.interplanetaryTimelines![0]).events;
  expect(events.filter(e=>e.kind==='science-received')).toHaveLength(1);
  const save=serializeCivilization(c),loaded=parseCivilization(save,world,at);
  expect(interplanetaryOperationRecord(loaded,loaded.interplanetaryTimelines![0]).events).toEqual(events);
  expect(serializeCivilization(c)).toBe(save);
 });
});

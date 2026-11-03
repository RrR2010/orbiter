import type {Civilization} from '../simulation/civilization';
import {celestialState,fromHeliocentricProbe,fromLocalFlight,transformState,solarFrame,type EntityId,type FrameId,type StateVector} from '../simulation/reference-frames';
import type {World} from '../simulation/world';
import {flightViewAt} from '../rendering/flight-view';
import {interplanetaryProbeSymbols} from '../rendering/interplanetary-probe-symbols';

export type ObservableKind='body'|'local-vehicle'|'interplanetary-probe';
export type ObservableEntity=Readonly<{id:EntityId;sourceId:string;kind:ObservableKind}>;
export type StateProvider=Readonly<{
 resolve(id:EntityId):ObservableEntity|null;
 at(id:EntityId,epochS:number,frameId:FrameId):StateVector|null;
}>;
export type StateTelemetry=Readonly<{
 entityId:EntityId;kind:ObservableKind;epochS:number;frameId:FrameId;
 positionM:StateVector['positionM'];velocityMs:StateVector['velocityMs'];
 massKg:number|null;fuelKg:number|null;source:'physical-state';
}>;

/** Distinct observer identities avoid changing legacy mission and save identifiers. */
export const bodyEntityId=(id:string):EntityId=`body/${id}`;
export const localVehicleEntityId=(id:string):EntityId=`local/${id}`;
export const probeEntityId=(id:string):EntityId=`probe/${id}`;

/** A read-only facade over existing physical samplers and M1 frame transformations. */
export function createStateProvider(world:World,civilization?:Readonly<Civilization>):StateProvider{
 const entries=new Map<EntityId,ObservableEntity>();
 for(const body of world.bodies)entries.set(bodyEntityId(body.id),{id:bodyEntityId(body.id),sourceId:body.id,kind:'body'});
 for(const mission of civilization?.missions??[])entries.set(localVehicleEntityId(mission.id),{
  id:localVehicleEntityId(mission.id),sourceId:mission.id,kind:'local-vehicle'
 });
 for(const timeline of civilization?.interplanetaryTimelines??[])entries.set(probeEntityId(timeline.missionId),{
  id:probeEntityId(timeline.missionId),sourceId:timeline.missionId,kind:'interplanetary-probe'
 });
 const resolve=(id:EntityId):ObservableEntity|null=>entries.get(id)??null;
 const at=(id:EntityId,epochS:number,frameId:FrameId):StateVector|null=>{
  if(!Number.isFinite(epochS)||epochS<0)throw new Error('Invalid observation epoch');
  const entity=resolve(id);
  if(!entity)return null;
  if(entity.kind==='body'){
   const state=celestialState(world,entity.sourceId,epochS,frameId);
   return {...state,entityId:entity.id};
  }
  if(entity.kind==='local-vehicle'){
   const mission=civilization?.missions.find(candidate=>candidate.id===entity.sourceId);
   const planet=world.bodies.find(body=>body.id===mission?.originId);
   if(!mission?.flight||!planet||planet.kind!=='planet'||epochS<mission.flight.plan.ignitionS)return null;
   const view=flightViewAt(mission,planet.radius,epochS);
   if(!view)return null;
   return transformState(world,fromLocalFlight(entity.id,planet.id,view.state),frameId);
  }
  const probe=interplanetaryProbeSymbols(civilization!,epochS,world).find(symbol=>symbol.missionId===entity.sourceId);
  return probe?transformState(world,fromHeliocentricProbe(entity.id,probe.state),frameId):null;
 };
 return {resolve,at};
}

/** Basic telemetry is sourced only from a physical state; absent resources remain unavailable. */
export function stateTelemetry(provider:StateProvider,id:EntityId,epochS:number,frameId:FrameId=solarFrame):StateTelemetry|null{
 const entity=provider.resolve(id),state=provider.at(id,epochS,frameId);
 return entity&&state?{entityId:id,kind:entity.kind,epochS:state.epochS,frameId:state.frameId,
  positionM:state.positionM,velocityMs:state.velocityMs,massKg:state.massKg??null,
  fuelKg:state.fuelKg??null,source:'physical-state'}:null;
}

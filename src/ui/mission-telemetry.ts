import type {Mission} from '../simulation/civilization';
import {flightViewAt} from '../rendering/flight-view';

export type MissionTelemetry = Readonly<{
 phase:string; altitudeM:number|null; speedMs:number|null; fuelKg:number|null;
 fuelFraction:number|null; massKg:number|null; deltaVMs:number|null; ispS:number|null;
 apoapsisM:number|null; periapsisM:number|null; targetApM:number|null;targetPeM:number|null;
}>;

/** Read-only, planet-centered telemetry in SI; no value is inferred from mission success. */
export function missionTelemetry(mission:Mission,radiusM:number,timeS:number):MissionTelemetry{
 const flight=mission.flight;
 const base={phase:mission.status==='preparing'?'Preparação':mission.status==='failure'?'Falha':mission.status==='success'?'Concluída':'Decolagem',altitudeM:null,speedMs:null,fuelKg:null,fuelFraction:null,massKg:null,deltaVMs:null,ispS:null,apoapsisM:null,periapsisM:null,targetApM:null,targetPeM:null};
 if(!flight)return base;
 const targetApM=flight.plan.target.apoapsisAltitudeM,targetPeM=flight.plan.target.periapsisAltitudeM;
 if(timeS<flight.plan.ignitionS)return {...base,targetApM,targetPeM};
 const view=flightViewAt(mission,radiusM,timeS);
 if(!view)return {...base,phase:mission.status==='failure'?'Impacto / falha':'Veículo indisponível',targetApM,targetPeM};
 const s=view.state,initial=flight.plan.initial,isp=flight.plan.ispS;
 const deltaVMs=s.massKg>0&&s.fuelKg>=0&&s.fuelKg<s.massKg&&isp>0
  ? 9.80665*isp*Math.log(s.massKg/(s.massKg-s.fuelKg)):null;
 const valid=(n:number):number|null=>Number.isFinite(n)?n:null;
 return {
  phase:view.phase==='ascent'?'Ascensão':view.phase==='circularization'?'Inserção orbital':view.phase==='coast'?(mission.status==='success'?'Em órbita':'Voo balístico'):view.phase==='impact'?'Impacto':'Falha',
  altitudeM:valid(Math.max(0,Math.hypot(s.position.x,s.position.y)-radiusM)),
  speedMs:valid(Math.hypot(s.velocity.x,s.velocity.y)),
  fuelKg:valid(s.fuelKg),fuelFraction:initial.fuelKg>0?valid(Math.max(0,Math.min(1,s.fuelKg/initial.fuelKg))):null,
  massKg:valid(s.massKg),deltaVMs:valid(deltaVMs??NaN),ispS:valid(isp),
  apoapsisM:view.orbit.apoapsisM===null?null:valid(view.orbit.apoapsisM-radiusM),
  periapsisM:view.orbit.periapsisM>radiusM?valid(view.orbit.periapsisM-radiusM):null,
  targetApM,targetPeM
 };
}

export function metricText(value:number|null,unit:'km'|'km/s'|'kg'|'m/s'|'s'|'%'):string{
 if(value===null||!Number.isFinite(value))return 'N/D';
 const n=unit==='km'?value/1000:unit==='km/s'?value/1000:unit==='%'?value*100:value;
 return n.toLocaleString('pt-BR',{maximumFractionDigits:unit==='km/s'?2:unit==='%'?0:1})+' '+unit;
}

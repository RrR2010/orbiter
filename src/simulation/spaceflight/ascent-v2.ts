import {poweredStep} from './integrator';
import {analyzeTrajectory} from './conics';
import type {FlightState,PlanetGravity,Burn} from './types';
import type {FlightCheckpointV2} from './executor-v2';

export type AscentProfileV2='vertical'|'gradual'|'tangential';
export type AscentResultV2=Readonly<{state:FlightState;checkpoints:readonly FlightCheckpointV2[];outcome:'cutoff'|'impact'|'fuel-exhausted'|'timeout'}>;

/** Event-time ascent guidance. Every decision and step depends exclusively on mission data. */
export function executeAscentV2(initial:FlightState,planet:PlanetGravity,options:Readonly<{
 targetApoapsisAltitudeM:number;thrustN:number;ispS:number;profile:AscentProfileV2;navigationError:number;
 stepS?:number;maxDurationS?:number;reservedFuelKg?:number;
}>):AscentResultV2{
 const {thrustN,ispS,profile}=options;
 const step=options.stepS??1,maxDuration=options.maxDurationS??1200,reserve=options.reservedFuelKg??Math.min(200,initial.fuelKg*.2);
 if(!(thrustN>0)||!(ispS>0)||!(step>0)||!(maxDuration>0)||reserve<0||reserve>=initial.fuelKg)throw new Error('Invalid ascent configuration');
 const targetAp=planet.radiusM+options.targetApoapsisAltitudeM*(1+options.navigationError);
 let state=initial,lastRecord=state.timeS,reason:'cutoff'|'impact'|'fuel-exhausted'|'timeout'='timeout';
 const checkpoints:FlightCheckpointV2[]=[{timeS:state.timeS,state,kind:'burn-start',reason:'Physical liftoff'}];
 // Control angle evolves with elapsed simulated time and radial velocity, not camera or frame time.
 while(state.timeS-initial.timeS<maxDuration-1e-9){
  const radius=Math.hypot(state.position.x,state.position.y);
  if(radius<=planet.radiusM&&state.timeS>initial.timeS+step){reason='impact';break;}
  if(state.fuelKg<=reserve+1e-8){reason='fuel-exhausted';break;}
  const orbit=analyzeTrajectory(state,planet);
  const elapsed=state.timeS-initial.timeS,altitude=Math.max(0,radius-planet.radiusM);
  if(orbit.apoapsisM!==null&&orbit.apoapsisM>=targetAp&&altitude>Math.min(planet.radiusM*.01,50000)){
   reason='cutoff';break;
  }
  const turnElapsed=Math.max(0,elapsed-12);
  const turnAltitude=Math.max(0,altitude-Math.max(500,planet.radiusM*.00002));
  const progress=Math.min(1,turnElapsed/(profile==='vertical'?180:profile==='gradual'?130:95),turnAltitude/Math.max(7000,planet.radiusM*.002));
  // Pitch is constrained by actual orbital energy and vertical motion, not elapsed time alone.
  // On high-gravity worlds a fast tangential turn can hold Ap at ~200 km while the rocket falls.
  const apoapsisAltitude=orbit.apoapsisM===null?Infinity:Math.max(0,orbit.apoapsisM-planet.radiusM);
  const apoapsisProgress=Math.min(1,apoapsisAltitude/Math.max(1,options.targetApoapsisAltitudeM));
  const radialSpeed=(state.position.x*state.velocity.x+state.position.y*state.velocity.y)/radius;
  const desiredTangent=progress*(profile==='vertical'?.78:profile==='gradual'?.99:1);
  const altitudeGate=Math.min(1,Math.max(0,(altitude-Math.max(1000,planet.radiusM*.00005))/Math.max(25000,planet.radiusM*.002)));
  const apoapsisGate=Math.min(1,.2+apoapsisProgress*1.15);
  let fraction=Math.min(.98,desiredTangent*altitudeGate,apoapsisGate);
  if(radialSpeed<0&&apoapsisProgress<.95)fraction=0;
  else if(radialSpeed<Math.max(5,Math.sqrt(planet.muM3S2/planet.radiusM)*.002)&&apoapsisProgress<.75)fraction=Math.min(fraction,.14);
  const dt=Math.min(step,maxDuration-elapsed,(state.fuelKg-reserve)*ispS*9.80665/thrustN);
  if(dt<=1e-9){reason='fuel-exhausted';break;}
  const burn:Burn={startS:state.timeS,endS:state.timeS+dt,thrustN,ispS,progradeFraction:fraction};
  state=poweredStep(state,planet,dt,burn);
  if(state.timeS-lastRecord>=20){checkpoints.push({timeS:state.timeS,state,kind:'burn-end',reason:'Ascent telemetry checkpoint'});lastRecord=state.timeS;}
 }
 checkpoints.push({timeS:state.timeS,state,kind:reason==='impact'?'impact':reason==='cutoff'?'burn-end':'partial',reason:'Ascent '+reason});
 return {state,checkpoints,outcome:reason};
}

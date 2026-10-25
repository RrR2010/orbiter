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
  const progress=Math.min(1,Math.max(0,elapsed/(profile==='vertical'?300:profile==='gradual'?190:105)));
  const tangent=profile==='vertical'?.08+progress*.38:profile==='gradual'?.04+progress*.95:.15+progress*.85;
  const fraction=Math.min(.98,tangent);
  const dt=Math.min(step,maxDuration-elapsed,(state.fuelKg-reserve)*ispS*9.80665/thrustN);
  if(dt<=1e-9){reason='fuel-exhausted';break;}
  const burn:Burn={startS:state.timeS,endS:state.timeS+dt,thrustN,ispS,progradeFraction:fraction};
  state=poweredStep(state,planet,dt,burn);
  if(state.timeS-lastRecord>=20){checkpoints.push({timeS:state.timeS,state,kind:'burn-end',reason:'Ascent telemetry checkpoint'});lastRecord=state.timeS;}
 }
 checkpoints.push({timeS:state.timeS,state,kind:reason==='impact'?'impact':reason==='cutoff'?'burn-end':'partial',reason:'Ascent '+reason});
 return {state,checkpoints,outcome:reason};
}

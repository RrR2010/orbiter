import {analyzeTrajectory} from './conics';
import {propagateCoast} from './coast';
import {poweredStep} from './integrator';
import {availableDeltaV,burnDurationForDeltaV,decideGuidance,type OrbitalGoal,type GuidanceDecision} from './guidance-v2';
import type {FlightState,PlanetGravity,Burn} from './types';

export type FlightCheckpointV2=Readonly<{timeS:number;state:FlightState;kind:'coast'|'burn-start'|'burn-progress'|'burn-end'|'impact'|'goal'|'partial'|'abort';reason:string}>;
export type FlightExecutionV2=Readonly<{checkpoints:readonly FlightCheckpointV2[];end:FlightState;decision:GuidanceDecision;outcome:'achieved'|'partial'|'aborted'|'burned'}>;
export type EngineV2=Readonly<{thrustN:number;ispS:number;stepS:number}>;

/** Single authoritative burn execution: fixed grid in simulation time; independent from FPS and camera. */
export function executeGuidanceV2(initial:FlightState,planet:PlanetGravity,goal:OrbitalGoal,engine:EngineV2):FlightExecutionV2{
 if(!(engine.thrustN>0)||!(engine.ispS>0)||!(engine.stepS>0)||!Number.isFinite(engine.stepS))throw new Error('Invalid V2 engine');
 let state=initial;
 const checkpoints:FlightCheckpointV2[]=[];
 let decision=decideGuidance(state,planet,goal,engine.ispS);
 if(decision.action==='goal-achieved')return {checkpoints:[{timeS:state.timeS,state,kind:'goal',reason:decision.reason}],end:state,decision,outcome:'achieved'};
 if(decision.action==='abort'||decision.action==='partial-orbit'){
  return {checkpoints:[{timeS:state.timeS,state,kind:decision.action==='abort'?'abort':'partial',reason:decision.reason}],end:state,decision,outcome:decision.action==='abort'?'aborted':'partial'};
 }
 if(decision.action==='coast-to-apoapsis'&&decision.targetTimeS!==null){
  const nodeTime=decision.targetTimeS;
  const durationAtNode=burnDurationForDeltaV(state,engine.ispS,engine.thrustN,decision.desiredDeltaVMs);
  // Center finite impulse around its Keplerian maneuver node, constrained by current time.
  const burnStart=Math.max(state.timeS,nodeTime-durationAtNode/2);
  if(burnStart>state.timeS){
   const coast=propagateCoast(state,planet,burnStart-state.timeS);
   state=coast;checkpoints.push({timeS:state.timeS,state,kind:'coast',reason:'Coast to centered apoapsis burn start'});
  }
  decision={...decision,action:'raise-periapsis',reason:'Centered finite burn to raise periapsis'};
 }
 if(decision.action!=='raise-periapsis'&&decision.action!=='raise-apoapsis'){
  const kind=decision.action==='goal-achieved'?'goal':'partial';
  checkpoints.push({timeS:state.timeS,state,kind,reason:decision.reason});
  return {checkpoints,end:state,decision,outcome:kind==='goal'?'achieved':'partial'};
 }
 const available=availableDeltaV(state,engine.ispS),dv=Math.min(available,decision.desiredDeltaVMs);
 const duration=burnDurationForDeltaV(state,engine.ispS,engine.thrustN,dv);
 if(duration<=0)return {checkpoints:[...checkpoints,{timeS:state.timeS,state,kind:'partial',reason:'No executable delta-v'}],end:state,decision,outcome:'partial'};
 const start=state.timeS,end=start+duration;
 let nextTelemetry=start+10;
 const burn:Burn={startS:start,endS:end,thrustN:engine.thrustN,ispS:engine.ispS,progradeFraction:decision.action==='raise-periapsis'?.94:1};
 checkpoints.push({timeS:start,state,kind:'burn-start',reason:decision.reason});
 // The solver performs deterministic work once per event, never once per render frame.
 while(state.timeS<end-1e-9){
  const dt=Math.min(engine.stepS,end-state.timeS);
  state=poweredStep(state,planet,dt,burn);
  const orbitNow=analyzeTrajectory(state,planet);
  if(state.timeS>=nextTelemetry-1e-9){checkpoints.push({timeS:state.timeS,state,kind:'burn-progress',reason:'Finite burn telemetry'});nextTelemetry=state.timeS+10;}
  if(decision.action==='raise-periapsis'&&orbitNow.kind==='elliptic'&&orbitNow.periapsisM>=planet.radiusM+goal.periapsisAltitudeM-goal.toleranceM){
   checkpoints.push({timeS:state.timeS,state,kind:'burn-end',reason:'Periapsis target reached: feedback cutoff'});
   return {checkpoints,end:state,decision,outcome:'burned'};
  }
  if(Math.hypot(state.position.x,state.position.y)<=planet.radiusM){
   checkpoints.push({timeS:state.timeS,state,kind:'impact',reason:'Surface collision during burn'});
   return {checkpoints,end:state,decision,outcome:'aborted'};
  }
 }
 checkpoints.push({timeS:state.timeS,state,kind:'burn-end',reason:'Target delta-v delivered or propellant exhausted'});
 const orbit=analyzeTrajectory(state,planet);
 if(orbit.kind==='elliptic'){
  const result=decideGuidance(state,planet,goal,engine.ispS);
  if(result.action==='goal-achieved')checkpoints.push({timeS:state.timeS,state,kind:'goal',reason:result.reason});
 }
 return {checkpoints,end:state,decision,outcome:'burned'};
}

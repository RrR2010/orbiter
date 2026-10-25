import {analyzeTrajectory} from './conics';
import {nextApoapsis} from './maneuvers';
import type {FlightState,PlanetGravity} from './types';

export type OrbitalGoal=Readonly<{periapsisAltitudeM:number;apoapsisAltitudeM:number;toleranceM:number}>;
export type FlightDecision='raise-apoapsis'|'coast-to-apoapsis'|'raise-periapsis'|'goal-achieved'|'partial-orbit'|'abort';
export type GuidanceDecision=Readonly<{action:FlightDecision;desiredDeltaVMs:number;targetTimeS:number|null;reason:string}>;

const G0=9.80665;
/** State-based decisions, no camera, warp, render-frame or stochastic input. */
export function decideGuidance(state:FlightState,planet:PlanetGravity,goal:OrbitalGoal,ispS:number):GuidanceDecision{
 const orbit=analyzeTrajectory(state,planet);
 if(!(ispS>0)||!(state.massKg>0)||!Number.isFinite(goal.apoapsisAltitudeM)||!Number.isFinite(goal.periapsisAltitudeM)||!(goal.toleranceM>=0))throw new Error('Invalid guidance input');
 const desiredAp=planet.radiusM+goal.apoapsisAltitudeM;
 const desiredPe=planet.radiusM+goal.periapsisAltitudeM;
 if(orbit.apoapsisM!==null&&Math.abs(orbit.apoapsisM-desiredAp)<=goal.toleranceM&&orbit.periapsisM>=desiredPe-goal.toleranceM){
  return {action:'goal-achieved',desiredDeltaVMs:0,targetTimeS:null,reason:'Orbital target reached'};
 }
 if(state.fuelKg<=0)return {action:orbit.surfaceIntersecting?'abort':'partial-orbit',desiredDeltaVMs:0,targetTimeS:null,reason:'Propellant exhausted'};
 if(orbit.apoapsisM===null||orbit.apoapsisM<desiredAp-goal.toleranceM){
  const r=Math.hypot(state.position.x,state.position.y),mu=planet.muM3S2;
  const requestedAp=Math.max(r+1,desiredAp);
  const required=Math.sqrt(Math.max(0,mu*(2/r-2/(r+requestedAp))));
  const velocity=Math.hypot(state.velocity.x,state.velocity.y);
  return {action:'raise-apoapsis',desiredDeltaVMs:Math.max(0,required-velocity),targetTimeS:null,reason:'Raise projected apoapsis'};
 }
 if(orbit.periapsisM<desiredPe-goal.toleranceM){
  const at=nextApoapsis(state,planet);
  if(at===null)return {action:'partial-orbit',desiredDeltaVMs:0,targetTimeS:null,reason:'No reachable apoapsis'};
  const ra=orbit.apoapsisM!;
  const desiredRp=Math.min(desiredPe,ra);
  const currentApSpeed=Math.sqrt(Math.max(0,planet.muM3S2*(2/ra-2/(ra+orbit.periapsisM))));
  const targetApSpeed=Math.sqrt(Math.max(0,planet.muM3S2*(2/ra-2/(ra+desiredRp))));
  const r=Math.hypot(state.position.x,state.position.y);
  const radialSpeed=(state.position.x*state.velocity.x+state.position.y*state.velocity.y)/r;
  const atApoapsis=Math.abs(r-ra)<=Math.max(100,ra*1e-6)&&Math.abs(radialSpeed)<1;
  return {action:atApoapsis?'raise-periapsis':'coast-to-apoapsis',desiredDeltaVMs:Math.max(0,targetApSpeed-currentApSpeed),targetTimeS:atApoapsis?state.timeS:at,reason:'Raise periapsis at apoapsis'};
 }
 return {action:'partial-orbit',desiredDeltaVMs:0,targetTimeS:null,reason:'Orbit differs from mission target'};
}
export function availableDeltaV(state:FlightState,ispS:number):number{
 if(!(ispS>0)||!(state.massKg>state.fuelKg)||state.fuelKg<0)throw new Error('Invalid engine mass');
 return ispS*G0*Math.log(state.massKg/(state.massKg-state.fuelKg));
}
export function burnDurationForDeltaV(state:FlightState,ispS:number,thrustN:number,requestedDeltaV:number):number{
 if(!(thrustN>0)||requestedDeltaV<0||!Number.isFinite(requestedDeltaV))throw new Error('Invalid burn request');
 const dv=Math.min(requestedDeltaV,availableDeltaV(state,ispS));
 const propellant=state.massKg*(1-Math.exp(-dv/(ispS*G0)));
 return propellant*ispS*G0/thrustN;
}

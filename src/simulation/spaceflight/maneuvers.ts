import type {FlightState,PlanetGravity} from './types';
import {analyzeTrajectory} from './conics';
import {propagateCoast} from './coast';

/** A two-body impulsive maneuver: mass and delta-v are real; the short burn is approximated as instantaneous. */
export type Maneuver=Readonly<{kind:'apoapsis-circularization';atS:number;deltaVMs:number;fuelKg:number;before:FlightState;after:FlightState}>;

/** Determine the next apoapsis from osculating elements, without FPS-dependent stepping. */
export function nextApoapsis(state:FlightState,planet:PlanetGravity):number|null{
 const orbit=analyzeTrajectory(state,planet);
 if(orbit.kind!=='elliptic'||orbit.periodS===null||orbit.eccentricity<1e-7)return null;
 const {position:r,velocity:v}=state,mu=planet.muM3S2,a=orbit.semiMajorAxisM!;
 const h=r.x*v.y-r.y*v.x,e=orbit.eccentricity,rmag=Math.hypot(r.x,r.y);
 const cosE=Math.max(-1,Math.min(1,(1-rmag/a)/e));
 const sinE=(r.x*v.x+r.y*v.y)/(e*Math.sqrt(mu*a));
 const E=Math.atan2(sinE,cosE);
 const M=E-e*Math.sin(E),n=Math.sqrt(mu/(a*a*a));
 let delta=(Math.PI-M)/n;
 const period=orbit.periodS;
 delta=((delta%period)+period)%period;
 if(delta<1e-7)delta=period;
 if(!Number.isFinite(h)||!Number.isFinite(E))return null;
 return state.timeS+delta;
}

/** Deterministically compute a prograde apoapsis maneuver to raise periapsis.
 * The burn is physically constrained by remaining propellant and Isp, never guaranteed.
 */
export function planApoapsisCircularization(state:FlightState,planet:PlanetGravity,targetPeriapsisAltitudeM:number,ispS:number):Maneuver|null{
 const atS=nextApoapsis(state,planet);
 if(atS===null||!(ispS>0)||!Number.isFinite(targetPeriapsisAltitudeM))return null;
 const orbit=analyzeTrajectory(state,planet);
 const ra=orbit.apoapsisM!;
 const rp=Math.min(ra,Math.max(planet.radiusM+1000,planet.radiusM+targetPeriapsisAltitudeM));
 if(rp<=orbit.periapsisM+1)return null;
 const before=propagateCoast(state,planet,atS-state.timeS);
 const velocity=Math.hypot(before.velocity.x,before.velocity.y),mu=planet.muM3S2;
 const desired=Math.sqrt(mu*(2/ra-2/(ra+rp)));
 const needed=Math.max(0,desired-velocity);
 const dry=state.massKg-state.fuelKg;
 if(!(dry>0)||!(state.fuelKg>0)||needed<=0||!(velocity>0))return null;
 const dvAvailable=ispS*9.80665*Math.log(state.massKg/dry);
 const dv=Math.min(needed,dvAvailable);
 if(!(dv>0))return null;
 const fuel=state.massKg*(1-Math.exp(-dv/(ispS*9.80665)));
 const factor=1+dv/velocity;
 const after:FlightState={...before,velocity:{x:before.velocity.x*factor,y:before.velocity.y*factor},massKg:before.massKg-fuel,fuelKg:Math.max(0,before.fuelKg-fuel)};
 return {kind:'apoapsis-circularization',atS,deltaVMs:dv,fuelKg:fuel,before,after};
}

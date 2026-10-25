import {seededRandom} from '../../core/random';
import type {Body} from '../world';
import {gravityForRadius} from './gravity';
import {analyzeTrajectory} from './conics';
import {poweredStep} from './integrator';
import {propagateCoast} from './coast';
import type {Burn,FlightState,PlanetGravity,Trajectory} from './types';

export type FlightPlan=Readonly<{
 version:1;planetId:string;ignitionS:number;initial:FlightState;
 ascent:Burn;insertion:Burn;ascentEndS:number;insertionEndS:number;
 reliabilityFailure:boolean;
}>;
export type FlightSnapshot=Readonly<{state:FlightState;orbit:Trajectory;phase:'ascent'|'insertion'|'coast'|'impact'|'failure';impacted:boolean}>;

/** Create a seeded local launch profile. All stochastic decisions occur at planning time. */
export function planFlight(seed:string,missionId:string,planet:Body,ignitionS:number,tier:number):FlightPlan{
 if(planet.kind!=='planet'||!Number.isFinite(ignitionS)||ignitionS<0)throw new Error('Invalid launch origin');
 const gravity=gravityForRadius(planet.radius),g=gravity.muM3S2/planet.radius**2;
 const rng=seededRandom('orbiter:flight:v1:'+seed+':'+missionId);
 const circularSpeed=Math.sqrt(gravity.muM3S2/(planet.radius+Math.max(120000,planet.radius*.03)));
 const fuelKg=720,dryKg=280,ispS=330+tier*15;
 const requiredDv=circularSpeed+g*130;
 const availableDv=ispS*9.80665*Math.log((fuelKg+dryKg)/dryKg);
 const effort=Math.min(1.5,Math.max(.5,requiredDv/Math.max(1,availableDv)))*(0.82+rng()*.35);
 const thrustN=Math.max(18000,(fuelKg+dryKg)*g*1.65)*effort;
 const launchAngle=rng()*2*Math.PI,r=planet.radius+10;
 const initial:FlightState={position:{x:r*Math.cos(launchAngle),y:r*Math.sin(launchAngle)},velocity:{x:0,y:0},massKg:dryKg+fuelKg,fuelKg,timeS:ignitionS};
 const ascentEndS=ignitionS+140,insertionEndS=ignitionS+300;
 return {version:1,planetId:planet.id,ignitionS,initial,ascentEndS,insertionEndS,
  ascent:{startS:ignitionS,endS:ascentEndS,thrustN,ispS,progradeFraction:.38},
  insertion:{startS:ascentEndS,endS:insertionEndS,thrustN:thrustN*.72,ispS,progradeFraction:1},
  reliabilityFailure:rng()<Math.max(.04,.22-tier*.035)};
}

/** Flight is sampled from its immutable ignition state, never incremented by a render frame. */
export function flightAt(plan:FlightPlan,planet:PlanetGravity,targetS:number):FlightSnapshot{
 if(!Number.isFinite(targetS)||targetS<plan.ignitionS)throw new Error('Invalid flight timestamp');
 let s=plan.initial,phase:FlightSnapshot['phase']='ascent',impacted=false;
 const burns=[plan.ascent,plan.insertion];
 for(const burn of burns){
  if(s.timeS>=targetS)break;
  const stop=Math.min(targetS,burn.endS);
  if(stop<=s.timeS)continue;
  // Integrate on whole-second boundaries rooted at ignition; only the final partial step is interpolated.
  const whole=Math.floor(stop-s.timeS);
  for(let i=0;i<whole;i++){
   s=poweredStep(s,planet,1,burn);
   if(Math.hypot(s.position.x,s.position.y)<=planet.radiusM){impacted=true;break;}
  }
  if(impacted)break;
  if(stop>s.timeS+1e-8)s=poweredStep(s,planet,stop-s.timeS,burn);
  if(Math.hypot(s.position.x,s.position.y)<=planet.radiusM){impacted=true;break;}
  phase=burn===plan.ascent?'ascent':'insertion';
 }
 if(!impacted&&targetS>plan.insertionEndS){
  const dt=targetS-plan.insertionEndS;
  s=propagateCoast(s,planet,dt);
  phase='coast';
 }
 const orbit=analyzeTrajectory(s,planet);
 if(impacted)phase='impact';
 else if(plan.reliabilityFailure&&targetS>=plan.insertionEndS)phase='failure';
 return {state:s,orbit,phase,impacted};
}

/** Operational success requires a physically bound, surface-clearing orbit and no failure. */
export function flightSucceeded(snapshot:FlightSnapshot,planet:PlanetGravity):boolean{
 return snapshot.phase!=='impact'&&snapshot.phase!=='failure'&&snapshot.orbit.kind==='elliptic'&&
 snapshot.orbit.periapsisM>planet.radiusM+Math.min(120000,planet.radiusM*.02);
}

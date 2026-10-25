import {planApoapsisCircularization} from './maneuvers';
import {planMissionObjective,type MissionTarget} from './objectives';
import {homeLaunchSite,sitePosition} from './surface-site';
import {seededRandom} from '../../core/random';
import type {Body} from '../world';
import {gravityForRadius} from './gravity';
import {analyzeTrajectory} from './conics';
import {poweredStep} from './integrator';
import {propagateUntilImpact} from './coast';
import type {Burn,FlightState,PlanetGravity,Trajectory} from './types';

export type FlightPlan=Readonly<{
 version:1;planetId:string;ignitionS:number;initial:FlightState;
 ascent:Burn;insertion:Burn;ascentEndS:number;insertionEndS:number;
 reliabilityFailure:boolean;objective?:MissionTarget;useApoapsisBurn?:boolean;
}>;
export type FlightSnapshot=Readonly<{state:FlightState;orbit:Trajectory;phase:'ascent'|'insertion'|'coast'|'impact'|'failure';impacted:boolean}>;

/** Create a seeded local launch profile. All stochastic decisions occur at planning time. */
export function planFlight(seed:string,missionId:string,planet:Body,ignitionS:number,tier:number):FlightPlan{
 if(planet.kind!=='planet'||!Number.isFinite(ignitionS)||ignitionS<0)throw new Error('Invalid launch origin');
 const gravity=gravityForRadius(planet.radius),g=gravity.muM3S2/planet.radius**2;
 const rng=seededRandom('orbiter:flight:v1:'+seed+':'+missionId);
 const circularSpeed=Math.sqrt(gravity.muM3S2/(planet.radius+Math.max(120000,planet.radius*.03)));
 // A physically integrated launch with technology-scaled propulsion and constant mass flow.
 // Performance is sized relative to local gravity; a fixed terrestrial engine cannot lift
 // off planets that range across nearly two orders of magnitude in radius.
 const fuelKg=720,dryKg=280;
 const ascentDuration=90,totalDuration=300;
 const objective=planMissionObjective(seed,missionId,planet.radius,ignitionS,tier);
 const targetRadius=planet.radius+Math.max(10000,objective.apoapsisAltitudeM);
 const targetSpeed=Math.sqrt(gravity.muM3S2/targetRadius);
 const profileFactor=(objective.objective==='suborbitalSurvey'?.5:objective.objective==='highApoapsis'?1.48:1.08)+rng()*.26;
 const missionDv=(Math.max(circularSpeed*.8,targetSpeed)+g*ascentDuration)*profileFactor;
 const ispS=Math.max(150,missionDv/(9.80665*Math.log((dryKg+fuelKg)/dryKg)));
 const thrustN=(fuelKg/totalDuration)*ispS*9.80665;
 const profileRoll=rng();
 const guidanceProfile=objective.objective==='suborbitalSurvey'?'vertical':profileRoll<.32?'vertical':profileRoll<.7?'gradual':'tangential';
 const ascentStart=guidanceProfile==='tangential'?.22:guidanceProfile==='gradual'?.05:0;
 const ascentEnd=guidanceProfile==='tangential'?.72:guidanceProfile==='gradual'?.38:.04;
 const insertionStart=guidanceProfile==='vertical'?.08:guidanceProfile==='gradual'?.38:.72;
 const insertionEnd=guidanceProfile==='vertical'?.55:1;
 const site=homeLaunchSite(seed,planet.id);
 const initial:FlightState={position:sitePosition(site,planet.radius),velocity:{x:0,y:0},massKg:dryKg+fuelKg,fuelKg,timeS:ignitionS};
 const ascentEndS=ignitionS+ascentDuration,insertionEndS=ignitionS+totalDuration;
 return {version:1,planetId:planet.id,ignitionS,initial,ascentEndS,insertionEndS,
  ascent:{startS:ignitionS,endS:ascentEndS,thrustN,ispS,progradeFraction:ascentStart,endProgradeFraction:ascentEnd},
  insertion:{startS:ascentEndS,endS:insertionEndS,thrustN,ispS,progradeFraction:insertionStart,endProgradeFraction:insertionEnd},
  reliabilityFailure:rng()<Math.max(.04,.22-tier*.035),objective,useApoapsisBurn:objective.objective!=='suborbitalSurvey'};
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
  const maneuver=plan.useApoapsisBurn&&plan.objective?planApoapsisCircularization(s,planet,plan.objective.periapsisAltitudeM,plan.insertion.ispS):null;
  if(maneuver&&targetS>=maneuver.atS){
   const before=propagateUntilImpact(s,planet,maneuver.atS-plan.insertionEndS);
   if(before.impacted){s=before.state;impacted=true;}
   else{
    const coast=propagateUntilImpact(maneuver.after,planet,targetS-maneuver.atS);
    s=coast.state;impacted=coast.impacted;
   }
  }else{
   const coast=propagateUntilImpact(s,planet,dt);
   s=coast.state;impacted=coast.impacted;
  }
  phase=impacted?'impact':'coast';
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

/** Planned orbital insertion cannot be judged before the apoapsis maneuver has occurred. */
export function flightResolutionTime(plan:FlightPlan,planet:PlanetGravity):number{
 if(!plan.useApoapsisBurn||!plan.objective)return plan.insertionEndS;
 const atBurnEnd=flightAt(plan,planet,plan.insertionEndS);
 if(atBurnEnd.impacted)return plan.insertionEndS;
 const maneuver=planApoapsisCircularization(atBurnEnd.state,planet,plan.objective.periapsisAltitudeM,plan.insertion.ispS);
 return maneuver&&maneuver.atS-plan.insertionEndS<=86400?maneuver.atS+1:plan.insertionEndS;
}

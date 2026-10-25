import {designVehicle,type VehicleCapability} from './vehicle-capability';
import {executeAscentV2} from './ascent-v2';
import {planMissionObjective,type MissionTarget} from './objectives';
import {gravityForRadius} from './gravity';
import {homeLaunchSite,sitePosition} from './surface-site';
import {analyzeTrajectory} from './conics';
import {executeGuidanceV2,type FlightCheckpointV2} from './executor-v2';
import {decideGuidance,type OrbitalGoal} from './guidance-v2';
import {propagateCoast} from './coast';
import {seededRandom} from '../../core/random';
import type {Body} from '../world';
import type {FlightState,PlanetGravity} from './types';

export type AutonomousFlightPlanV2=Readonly<{
 version:2;id:string;planetId:string;ignitionS:number;initial:FlightState;
 target:MissionTarget;goal:OrbitalGoal;thrustN:number;ispS:number;
 ascentProfile:'vertical'|'gradual'|'tangential';navigationError:number;vehicle?:VehicleCapability;
}>;
export type AutonomousFlightResultV2=Readonly<{
 version:2;plan:AutonomousFlightPlanV2;checkpoints:readonly FlightCheckpointV2[];
 terminal:FlightState;outcome:'achieved'|'partial'|'failed';reason:string;
 orbital:boolean;goalAchieved:boolean;
}>;

/** Seed-scoped mission identity: render/camera/warp cannot affect planning. */
export function createAutonomousFlightV2(seed:string,id:string,planet:Body,ignitionS:number,tier:number,knowledge=0):AutonomousFlightPlanV2{
 if(planet.kind!=='planet')throw new Error('V2 launch requires planet');
 const rng=seededRandom('orbiter:autonomous-v2:'+seed+':'+id);
 const target=planMissionObjective(seed,id,planet.radius,ignitionS,tier);
 const radius=planet.radius,gravity=gravityForRadius(radius);
 const vehicle=designVehicle(gravity,tier,knowledge,rng());
 const {fuelKg,dryKg,ispS,thrustN}=vehicle;
 const deviation=(rng()-.5)*2*vehicle.guidanceError;
 const profiles=['vertical','gradual','tangential'] as const;
 const profile=target.objective==='suborbitalSurvey'?'vertical':profiles[Math.floor(rng()*profiles.length)];
 return {version:2,id,planetId:planet.id,ignitionS,
  initial:{position:sitePosition(homeLaunchSite(seed,planet.id),radius),velocity:{x:0,y:0},massKg:dryKg+fuelKg,fuelKg,timeS:ignitionS},
  target,goal:{periapsisAltitudeM:target.periapsisAltitudeM,apoapsisAltitudeM:target.apoapsisAltitudeM,toleranceM:Math.max(20000,radius*.003)},
  thrustN,ispS,ascentProfile:profile,navigationError:deviation,vehicle};
}

/** Bounded authoritative trajectory run, once per launch event, never once per render frame.
 * V2 ascent is an early control prototype: subsequent improvements will replace its fixed ascent
 * decision cadence with an apoapsis feedback loop.
 */
export function resolveAutonomousFlightV2(plan:AutonomousFlightPlanV2,planet:PlanetGravity):AutonomousFlightResultV2{
 let state=plan.initial;
 const checkpoints:FlightCheckpointV2[]=[];
 const ascent=executeAscentV2(state,planet,{
  targetApoapsisAltitudeM:plan.goal.apoapsisAltitudeM,
  thrustN:plan.thrustN,ispS:plan.ispS,profile:plan.ascentProfile,
  navigationError:plan.navigationError,stepS:1,reservedFuelKg:state.fuelKg*(plan.vehicle?.reserveFraction??.23)
 });
 checkpoints.push(...ascent.checkpoints);
 state=ascent.state;
 if(ascent.outcome==='impact'){
  return {version:2,plan,checkpoints,terminal:state,outcome:'failed',reason:'Surface collision during ascent',orbital:false,goalAchieved:false};
 }
 if(plan.target.objective==='suborbitalSurvey'){const orbit=analyzeTrajectory(state,planet);const achieved=orbit.apoapsisM!==null&&orbit.apoapsisM-planet.radiusM>=plan.goal.apoapsisAltitudeM-plan.goal.toleranceM;const reason=achieved?'Suborbital survey altitude reached':'Suborbital survey altitude missed';checkpoints.push({timeS:state.timeS,state,kind:achieved?'goal':'partial',reason});return {version:2,plan,checkpoints,terminal:state,outcome:achieved?'achieved':'failed',reason,orbital:false,goalAchieved:achieved};}
 const engine={thrustN:plan.thrustN*.35,ispS:plan.ispS,stepS:2};
 const correction=executeGuidanceV2(state,planet,plan.goal,engine);
 checkpoints.push(...correction.checkpoints);
 state=correction.end;
 const orbit=analyzeTrajectory(state,planet);
 const orbital=orbit.kind==='elliptic'&&!orbit.surfaceIntersecting;
 const decision=decideGuidance(state,planet,plan.goal,plan.ispS);
 const goalAchieved=decision.action==='goal-achieved';
 const outcome=goalAchieved?'achieved':orbital?'partial':'failed';
 const reason=goalAchieved?'Orbit targets met':orbital?'Operational orbit, target missed':'No stable orbit';
 checkpoints.push({timeS:state.timeS,state,kind:goalAchieved?'goal':orbital?'partial':'abort',reason});
 return {version:2,plan,checkpoints,terminal:state,outcome,reason,orbital,goalAchieved};
}

/** Query immutable checkpoints at arbitrary simulated time; no physics authority depends on focus. */
export function sampleAutonomousFlightWithPlanet(result:AutonomousFlightResultV2,planet:PlanetGravity,atS:number):FlightState{
 const checkpoints=result.checkpoints;
 if(atS<=checkpoints[0].timeS)return checkpoints[0].state;
 let prev=checkpoints[0];
 for(const checkpoint of checkpoints){
  if(checkpoint.timeS>atS){
   if(checkpoint.timeS>prev.timeS&&((prev.kind==='burn-start'||prev.reason==='Ascent telemetry checkpoint')&&(checkpoint.reason==='Ascent telemetry checkpoint'||checkpoint.reason.startsWith('Ascent '))||(prev.kind==='burn-start'||prev.kind==='burn-progress')&&(checkpoint.kind==='burn-progress'||checkpoint.kind==='burn-end'))){
    const fraction=(atS-prev.timeS)/(checkpoint.timeS-prev.timeS);
    return {...prev.state,
     position:{x:prev.state.position.x+(checkpoint.state.position.x-prev.state.position.x)*fraction,y:prev.state.position.y+(checkpoint.state.position.y-prev.state.position.y)*fraction},
     velocity:{x:prev.state.velocity.x+(checkpoint.state.velocity.x-prev.state.velocity.x)*fraction,y:prev.state.velocity.y+(checkpoint.state.velocity.y-prev.state.velocity.y)*fraction},
     massKg:prev.state.massKg+(checkpoint.state.massKg-prev.state.massKg)*fraction,
     fuelKg:prev.state.fuelKg+(checkpoint.state.fuelKg-prev.state.fuelKg)*fraction,timeS:atS};
   }
   return propagateCoast(prev.state,planet,atS-prev.timeS);
  }
  prev=checkpoint;
 }
 return propagateCoast(result.terminal,planet,atS-result.terminal.timeS);
}

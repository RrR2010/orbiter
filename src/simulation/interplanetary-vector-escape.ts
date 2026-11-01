import type {Vec2} from './orbits';
import type {World} from './world';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import type {FlightState} from './spaceflight/types';
import {planLambertDeparture,type LambertDeparture} from './interplanetary-lambert-departure';
import {propagatePlanetaryEscape,type EscapeResult} from './interplanetary-escape';

const rotate=(v:Vec2,angle:number):Vec2=>({
 x:v.x*Math.cos(angle)-v.y*Math.sin(angle),
 y:v.x*Math.sin(angle)+v.y*Math.cos(angle),
});

/** A real planet-centered hyperbola oriented to the Lambert excess velocity.
 * The exit direction is matched at the finite SOI, where gravity still
 * contributes an unavoidable difference to the asymptotic speed.
 */
export type VectorEscape=Readonly<{
 plan:LambertDeparture;initial:FlightState;escape:EscapeResult;
 directionErrorRad:number;excessVelocityResidualMs:number;
}>;

/** Shoot a tangential parking-orbit injection to match the desired SOI heading.
 * Rotational symmetry of two-body motion permits one calibration coast before
 * rotating both position and velocity; the final coast independently verifies
 * the actual SOI crossing, fuel and mass.
 */
export function planVectorEscape(
 world:World,originId:string,targetId:string,departureS:number,arrivalS:number,
 vehicle:VehicleCapability,
):VectorEscape|null{
 const plan=planLambertDeparture(world,originId,targetId,departureS,arrivalS,vehicle);
 if(!plan||!plan.feasible||!(plan.excessSpeedMs>0))return null;
 const massKg=vehicle.dryKg+vehicle.fuelKg-plan.requiredFuelKg;
 const fuelKg=vehicle.fuelKg-plan.requiredFuelKg;
 if(!(massKg>0&&fuelKg>=0))return null;
 const initial:FlightState={
  position:{x:0,y:-plan.parkingRadiusM},
  velocity:{x:plan.injectionSpeedMs,y:0},
  timeS:departureS,massKg,fuelKg,
 };
 const calibration=propagatePlanetaryEscape(world,originId,initial);
 if(!calibration)return null;
 const desired=Math.atan2(plan.excessVelocity.y,plan.excessVelocity.x);
 const actual=Math.atan2(calibration.localAtBoundary.velocity.y,calibration.localAtBoundary.velocity.x);
 const offset=Math.atan2(Math.sin(desired-actual),Math.cos(desired-actual));
 const aligned:FlightState={
  ...initial,position:rotate(initial.position,offset),
  velocity:rotate(initial.velocity,offset),
 };
 const escape=propagatePlanetaryEscape(world,originId,aligned);
 if(!escape)return null;
 const exit=escape.localAtBoundary.velocity;
 const directionErrorRad=Math.atan2(
  exit.x*plan.excessVelocity.y-exit.y*plan.excessVelocity.x,
  exit.x*plan.excessVelocity.x+exit.y*plan.excessVelocity.y,
 );
 const excessVelocityResidualMs=Math.hypot(exit.x-plan.excessVelocity.x,exit.y-plan.excessVelocity.y);
 return {plan,initial:aligned,escape,directionErrorRad,excessVelocityResidualMs};
}

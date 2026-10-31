import {orbitalPosition} from './orbits';
import type {World} from './world';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import type {FlightState} from './spaceflight/types';
import {propagateCoast} from './spaceflight/coast';
import {solveLambert2D} from './interplanetary-lambert';
import {simulateLambertPhysicalTransfer} from './interplanetary-lambert-physical-transfer';

const SOLAR_MU=1.32712440018e20,G0=9.80665;

/** One impulsive midcourse correction with physical fuel consumption.
 * The corrected trajectory starts at the propagated checkpoint, never at the
 * intended orbit. The same arrival epoch and real target ephemeris are used.
 */
export type MidcourseCorrection=Readonly<{
 checkpointBefore:FlightState;checkpointAfter:FlightState;arrival:FlightState;
 deltaVMs:number;fuelSpentKg:number;missBeforeM:number;missAfterM:number;
}>;

export function correctLambertMidcourse(
 world:World,originId:string,targetId:string,departureS:number,arrivalS:number,
 vehicle:VehicleCapability,checkpointFraction=.5,aimOffsetRadii=0,
):MidcourseCorrection|null{
 if(!Number.isFinite(aimOffsetRadii)||aimOffsetRadii<0||aimOffsetRadii>10)
  throw new Error('Invalid flyby aim offset');
 if(!Number.isFinite(checkpointFraction)||checkpointFraction<=0||checkpointFraction>=1)
  throw new Error('Invalid checkpoint fraction');
 const transfer=simulateLambertPhysicalTransfer(world,originId,targetId,departureS,arrivalS,vehicle);
 const target=world.bodies.find(body=>body.id===targetId);
 if(!transfer||!target||!target.orbit)return null;
 const start=transfer.escape.escape.heliocentric;
 const checkpointS=start.timeS+(arrivalS-start.timeS)*checkpointFraction;
 const gravity={radiusM:1,muM3S2:SOLAR_MU};
 const checkpointBefore=propagateCoast(start,gravity,checkpointS-start.timeS);
 const center=orbitalPosition(target.orbit,arrivalS);
 // Offset the intended endpoint sideways to obtain a non-impacting flyby.
 // The true planet position remains unchanged for geometric assessment.
 const length=Math.hypot(center.x,center.y);
 const destination={x:center.x-center.y/length*target.radius*aimOffsetRadii,
  y:center.y+center.x/length*target.radius*aimOffsetRadii};
 const solution=solveLambert2D(checkpointBefore.position,destination,arrivalS-checkpointS,SOLAR_MU);
 if(!solution)return null;
 const deltaVMs=Math.hypot(
  solution.departureVelocity.x-checkpointBefore.velocity.x,
  solution.departureVelocity.y-checkpointBefore.velocity.y);
 const initialMass=checkpointBefore.massKg;
 const fuelSpentKg=initialMass*(-Math.expm1(-deltaVMs/(vehicle.ispS*G0)));
 if(!Number.isFinite(fuelSpentKg)||fuelSpentKg>checkpointBefore.fuelKg)return null;
 const checkpointAfter:FlightState={...checkpointBefore,
  velocity:solution.departureVelocity,
  massKg:initialMass-fuelSpentKg,
  fuelKg:checkpointBefore.fuelKg-fuelSpentKg};
 const arrival=propagateCoast(checkpointAfter,gravity,arrivalS-checkpointS);
 const missAfterM=Math.hypot(arrival.position.x-destination.x,arrival.position.y-destination.y);
 return {checkpointBefore,checkpointAfter,arrival,deltaVMs,fuelSpentKg,
  missBeforeM:transfer.arrivalMissM,missAfterM};
}

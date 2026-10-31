import {orbitalPosition,type Vec2} from './orbits';
import type {World} from './world';
import {planetaryVelocityAt} from './interplanetary-handoff';
import {solveLambert2D,type LambertTransfer} from './interplanetary-lambert';
import {gravityForRadius} from './spaceflight/gravity';
import type {VehicleCapability} from './spaceflight/vehicle-capability';

const SOLAR_MU=1.32712440018e20,G0=9.80665;
const subtract=(a:Vec2,b:Vec2):Vec2=>({x:a.x-b.x,y:a.y-b.y});

/** A heliocentric Lambert departure mapped onto an ideal parking-orbit burn.
 * This is a required asymptotic v-infinity vector, NOT a simulated SOI exit.
 */
export type LambertDeparture=Readonly<{
 transfer:LambertTransfer;excessVelocity:Vec2;excessSpeedMs:number;c3M2S2:number;
 parkingRadiusM:number;parkingSpeedMs:number;injectionSpeedMs:number;
 burnDeltaVMs:number;requiredFuelKg:number;feasible:boolean;
}>;

/** Derive the required hyperbolic energy and ideal impulse from Lambert.
 * Only planet ephemerides are used for target geometry, never a fabricated hit.
 */
export function planLambertDeparture(
 world:World,originId:string,targetId:string,departureS:number,arrivalS:number,
 vehicle:VehicleCapability,
):LambertDeparture|null{
 if(!Number.isFinite(departureS)||departureS<0||
  !Number.isFinite(arrivalS)||arrivalS<=departureS)throw new Error('Invalid Lambert epochs');
 const home=world.bodies.find(body=>body.id===originId);
 const target=world.bodies.find(body=>body.id===targetId);
 if(!home||!target||home.id===target.id||home.kind!=='planet'||
  target.kind!=='planet'||!home.orbit||!target.orbit)return null;
 if(!(vehicle.dryKg>0&&vehicle.fuelKg>=0&&vehicle.ispS>0)||
  ![vehicle.dryKg,vehicle.fuelKg,vehicle.ispS].every(Number.isFinite))
  throw new Error('Invalid Lambert propulsion');
 const transfer=solveLambert2D(
  orbitalPosition(home.orbit,departureS),
  orbitalPosition(target.orbit,arrivalS),arrivalS-departureS,SOLAR_MU);
 if(!transfer)return null;
 const excessVelocity=subtract(transfer.departureVelocity,planetaryVelocityAt(home,departureS));
 const excessSpeedMs=Math.hypot(excessVelocity.x,excessVelocity.y);
 const mu=gravityForRadius(home.radius).muM3S2;
 const parkingRadiusM=home.radius+Math.max(120000,home.radius*.025);
 const parkingSpeedMs=Math.sqrt(mu/parkingRadiusM);
 const injectionSpeedMs=Math.sqrt(excessSpeedMs**2+2*mu/parkingRadiusM);
 const burnDeltaVMs=injectionSpeedMs-parkingSpeedMs;
 const initialMass=vehicle.dryKg+vehicle.fuelKg;
 const requiredFuelKg=initialMass*(-Math.expm1(-burnDeltaVMs/(G0*vehicle.ispS)));
 return {
  transfer,excessVelocity,excessSpeedMs,c3M2S2:excessSpeedMs**2,
  parkingRadiusM,parkingSpeedMs,injectionSpeedMs,burnDeltaVMs,requiredFuelKg,
  feasible:Number.isFinite(requiredFuelKg)&&requiredFuelKg<=vehicle.fuelKg,
 };
}

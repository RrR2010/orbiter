import type {Body} from './world';
import type {FlightState} from './spaceflight/types';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import {gravityForRadius} from './spaceflight/gravity';
import type {TransferOpportunity} from './interplanetary-planner';

const G0=9.80665;
export type EscapeInjection=Readonly<{state:FlightState;burnDeltaVMs:number;fuelSpentKg:number;fuelRemainingKg:number}>;

/** Model an instantaneous escape injection from an already achieved parking orbit.
 * This is not a launch vehicle or ascent simulation. The rocket equation conserves
 * dry mass and consumes real propellant for the specified ideal impulse.
 */
export function planEscapeInjection(home:Body,target:Body,opportunity:TransferOpportunity,vehicle:VehicleCapability,timeS:number):EscapeInjection|null{
 if(home.kind!=='planet'||target.kind!=='planet'||!home.orbit||!target.orbit||
  home.id!==opportunity.originId||target.id!==opportunity.targetId||!Number.isFinite(timeS))throw new Error('Invalid escape injection');
 const mu=gravityForRadius(home.radius).muM3S2;
 const parkingRadius=home.radius+Math.max(120000,home.radius*.025);
 const parkingSpeed=Math.sqrt(mu/parkingRadius);
 const sunMu=1.32712440018e20,r1=home.orbit.semiMajorAxis,r2=target.orbit.semiMajorAxis;
 const excessSpeed=Math.abs(Math.sqrt(sunMu/r1)*(Math.sqrt(2*r2/(r1+r2))-1));
 const injectionSpeed=Math.sqrt(excessSpeed**2+2*mu/parkingRadius);
 const burnDeltaVMs=injectionSpeed-parkingSpeed;
 if(!(vehicle.ispS>0&&vehicle.dryKg>0&&vehicle.fuelKg>=0&&Number.isFinite(burnDeltaVMs)))throw new Error('Invalid propulsion capability');
 const initialMass=vehicle.dryKg+vehicle.fuelKg;
 const finalMass=initialMass*Math.exp(-burnDeltaVMs/(vehicle.ispS*G0));
 const fuelSpentKg=initialMass-finalMass;
 if(fuelSpentKg>vehicle.fuelKg||!Number.isFinite(fuelSpentKg))return null;
 const outward=target.orbit.semiMajorAxis>home.orbit.semiMajorAxis;
 // Tangential velocity at parking radius: physical hyperbolic escape after the impulse.
 const state:FlightState={position:{x:parkingRadius,y:0},velocity:{x:0,y:injectionSpeed*(outward?1:-1)},
  timeS,massKg:finalMass,fuelKg:vehicle.fuelKg-fuelSpentKg};
 return {state,burnDeltaVMs,fuelSpentKg,fuelRemainingKg:state.fuelKg};
}

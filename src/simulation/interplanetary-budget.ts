import type {TransferOpportunity} from './interplanetary-planner';
import type {VehicleCapability} from './spaceflight/vehicle-capability';
import {gravityForRadius} from './spaceflight/gravity';
import type {Body} from './world';

/** Preliminary patched-conic launch budget in SI; not a simulated planetary escape. */
export type TransferBudget=Readonly<{
 escapeDeltaVMs:number;injectionDeltaVMs:number;requiredDeltaVMs:number;
 availableDeltaVMs:number;marginDeltaVMs:number;feasible:boolean;
}>;

/** Calculate the minimum departure budget assuming circular parking orbit and tangential escape.
 * The flyby does NOT include the Hohmann arrival circularization burn.
 */
export function estimateTransferBudget(home:Body,target:Body,opportunity:TransferOpportunity,vehicle:VehicleCapability,reserveFraction=.15):TransferBudget{
 if(home.kind!=='planet'||target.kind!=='planet'||!home.orbit||!target.orbit||home.id!==opportunity.originId||target.id!==opportunity.targetId)throw new Error('Invalid transfer endpoints');
 if(!Number.isFinite(reserveFraction)||reserveFraction<0||reserveFraction>=1||!Number.isFinite(vehicle.deltaVMs)||vehicle.deltaVMs<=0)throw new Error('Invalid transfer capacity');
 const mu=gravityForRadius(home.radius).muM3S2;
 const parkingRadius=home.radius+Math.max(120000,home.radius*.025);
 const parkingSpeed=Math.sqrt(mu/parkingRadius);
 const solarMu=1.32712440018e20;
 const r1=home.orbit.semiMajorAxis,r2=target.orbit.semiMajorAxis;
 const excessSpeed=Math.abs(Math.sqrt(solarMu/r1)*(Math.sqrt(2*r2/(r1+r2))-1));
 const escapeDeltaVMs=Math.sqrt(excessSpeed**2+2*mu/parkingRadius)-parkingSpeed;
 // Launching from the surface also requires attaining the parking orbit.
 const insertionDeltaVMs=parkingSpeed+Math.sqrt(mu/home.radius)*.1;
 const requiredDeltaVMs=insertionDeltaVMs+escapeDeltaVMs;
 const availableDeltaVMs=vehicle.deltaVMs*(1-reserveFraction);
 return {escapeDeltaVMs,injectionDeltaVMs:insertionDeltaVMs,requiredDeltaVMs,availableDeltaVMs,
  marginDeltaVMs:availableDeltaVMs-requiredDeltaVMs,feasible:availableDeltaVMs>=requiredDeltaVMs};
}

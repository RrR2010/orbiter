import type {PlanetGravity} from './types';

export type VehicleCapability=Readonly<{
 technologyStage:number;experience:number;dryKg:number;fuelKg:number;
 ispS:number;thrustN:number;initialTwr:number;deltaVMs:number;
 guidanceError:number;reserveFraction:number;
}>;

/** Progression modifies real vehicle constraints, never a magic velocity cap.
 * The orbital difficulty of the home planet remains part of the design envelope.
 * Experience grows slowly after the technology tree is unlocked.
 */
export function designVehicle(planet:PlanetGravity,stage:number,knowledge:number,variation:number):VehicleCapability{
 if(!Number.isFinite(knowledge)||knowledge<0||!Number.isInteger(stage)||stage<0||stage>4||variation<0||variation>1)throw new Error('Invalid technology inputs');
 const experience=Math.min(1,Math.log2(1+knowledge/3000)/4);
 const advancement=stage/4*.72+experience*.28;
 const dryKg=650-advancement*230;
 const fuelKg=1250+advancement*750;
 const g=planet.muM3S2/(planet.radiusM*planet.radiusM);
 const targetRadius=planet.radiusM+Math.max(120000,planet.radiusM*.025);
 const circularSpeed=Math.sqrt(planet.muM3S2/targetRadius);
 const ratio=Math.log((dryKg+fuelKg)/dryKg);
 // The generator's gravity scale varies enormously; normalize to a minimum
 // capability envelope, but early technologies receive substantially less margin.
 const theoreticalMin=(circularSpeed*(1.1+advancement*.4)+g*85)/(9.80665*ratio);
 const ispS=Math.max(280+advancement*300,theoreticalMin);
 const initialTwr=1.5+advancement*.35+(variation-.5)*.16;
 const thrustN=(dryKg+fuelKg)*g*initialTwr;
 const deltaVMs=ispS*9.80665*ratio;
 return {
  technologyStage:stage,experience,dryKg,fuelKg,ispS,thrustN,initialTwr,deltaVMs,
  guidanceError:.16*(1-advancement*.75),reserveFraction:.15+advancement*.14
 };
}

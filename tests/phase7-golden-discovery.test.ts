import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {createAutonomousFlightV2,resolveAutonomousFlightV2} from '../src/simulation/spaceflight/flight-v2';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {simulateLambertPhysicalTransfer} from '../src/simulation/interplanetary-lambert-physical-transfer';
import {assessPlanetaryApproach} from '../src/simulation/interplanetary-approach';

/** Bounded, deterministic discovery only: never substitute a fabricated success for physical propagation. */
describe('phase 7 golden candidate discovery',()=>{
 it('reports actual orbital and flyby outcomes for reproducible candidate inputs',()=>{
  const world=generateWorld('phase-five-injection');
  const planets=world.bodies.filter(body=>body.kind==='planet');
  const origin=planets[0],target=planets[1];
  expect(origin).toBeDefined();
  expect(target).toBeDefined();
  const gravity=gravityForRadius(origin.radius);
  const flights=[] as Array<{id:string;outcome:string;orbital:boolean;goalAchieved:boolean;fuelKg:number;timeS:number}>;
  for(let i=0;i<24;i++){
   const id='phase7-discovery-'+i;
   const result=resolveAutonomousFlightV2(createAutonomousFlightV2(world.seed,id,origin,100,4),gravity);
   flights.push({id,outcome:result.outcome,orbital:result.orbital,
    goalAchieved:result.goalAchieved,fuelKg:result.terminal.fuelKg,timeS:result.terminal.timeS});
  }
  const standard=designVehicle(gravity,4,3000,.5);
  const vehicle={...standard,ispS:1e7};
  const transfers=[] as Array<{departureS:number;arrivalS:number;outcome:string;closestDistanceM:number;closestAltitudeM:number}>;
  for(let i=0;i<8;i++){
   const departureS=1e6,arrivalS=4e6+i*5e5;
   const result=simulateLambertPhysicalTransfer(world,origin.id,target.id,departureS,arrivalS,vehicle);
   if(!result)continue;
   const geometry={closestDistanceM:result.closestDistanceM,
    closestAltitudeM:result.closestAltitudeM,closestRelativeSpeedMs:2500} as Parameters<typeof assessPlanetaryApproach>[0];
   transfers.push({departureS,arrivalS,outcome:assessPlanetaryApproach(geometry,target).outcome,
    closestDistanceM:result.closestDistanceM,closestAltitudeM:result.closestAltitudeM});
  }
  const summary={seed:world.seed,orbital:flights.filter(f=>f.orbital),
   achieved:flights.filter(f=>f.goalAchieved),
   flightOutcomes:flights.reduce<Record<string,number>>((counts,f)=>(counts[f.outcome]=(counts[f.outcome]??0)+1,counts),{}),
   flybys:transfers.filter(t=>t.outcome==='flyby'),transfers};
  console.log('PHASE7_GOLDEN_DISCOVERY '+JSON.stringify(summary));
  expect(flights).toHaveLength(24);
  expect(transfers.length).toBeGreaterThan(0);
 });
});

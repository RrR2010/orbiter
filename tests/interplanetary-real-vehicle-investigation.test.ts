import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization} from '../src/simulation/civilization';
import {proposeInterplanetaryLaunch} from '../src/simulation/interplanetary-schedule';
import {findLambertLaunchWindow} from '../src/simulation/interplanetary-lambert-window';
import {planLambertDeparture} from '../src/simulation/interplanetary-lambert-departure';
import {prepareInterplanetaryMission} from '../src/simulation/interplanetary-mission-manifest';
import {designVehicle} from '../src/simulation/spaceflight/vehicle-capability';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

/** Print actual, unmodified stage-4 vehicle feasibility, not an artificial ISP. */
describe('real vehicle interplanetary feasibility investigation',()=>{
 for(const seed of ['phase-five-injection','phase-five-real-vehicle','orbiter-autonomous']){
  it('diagnoses actual vehicle and transfer gates for '+seed,()=>{
   const world=generateWorld(seed),c=createCivilization(world);
   c.stage=4;c.resources=300;c.knowledge=3000;
   const home=world.bodies.find(body=>body.id===c.homeId)!;
   const vehicle=designVehicle(gravityForRadius(home.radius),c.stage,c.knowledge,.5);
   const intent=proposeInterplanetaryLaunch(c,world,c.time);
   const plan=intent?.candidate.opportunity;
   const departure=plan?planLambertDeparture(world,plan.originId,plan.targetId,
    plan.departureS,plan.arrivalS,vehicle):null;
   const adjusted=plan?findLambertLaunchWindow(world,plan,vehicle):null;
   const manifest=plan?prepareInterplanetaryMission(world,plan.originId,plan.targetId,
    plan.departureS,plan.arrivalS,vehicle):null;
   const adjustedManifest=adjusted?prepareInterplanetaryMission(world,plan!.originId,plan!.targetId,
    adjusted.departureS,adjusted.arrivalS,vehicle):null;
   const diagnostic={
    seed,homeId:home.id,technologyStage:c.stage,vehicleIspS:vehicle.ispS,
    vehicleDeltaVMs:vehicle.deltaVMs,vehicleFuelKg:vehicle.fuelKg,
    selectedTargetId:plan?.targetId??null,
    budgetFeasible:intent?.candidate.budget.feasible??false,
    lambertFeasible:departure?.feasible??false,
    lambertBurnDeltaVMs:departure?.burnDeltaVMs??null,
    lambertFuelRequiredKg:departure?.requiredFuelKg??null,
    adjustedLambertAvailable:adjusted!==null,
    adjustedOffsetS:adjusted?.offsetS??null,
    adjustedLambertBurnDeltaVMs:adjusted?.plan.burnDeltaVMs??null,
    physicalManifestAvailable:manifest!==null,
    adjustedManifestAvailable:adjustedManifest!==null,
    adjustedPhysicalOutcome:adjustedManifest?.outcome??null,
    adjustedClosestAltitudeM:adjustedManifest?.closestAltitudeM??null,
    adjustedRemainingFuelKg:adjustedManifest?.remainingFuelKg??null,
    physicalOutcome:manifest?.outcome??null,
    remainingFuelKg:manifest?.remainingFuelKg??null,
   };
   console.info('ORBITER REAL PROBE GATES:',JSON.stringify(diagnostic));
   expect(Number.isFinite(vehicle.deltaVMs)).toBe(true);
   expect(vehicle.fuelKg).toBeGreaterThan(0);
   if(manifest){
    expect(departure?.feasible).toBe(true);
    expect(manifest.remainingFuelKg).toBeGreaterThanOrEqual(0);
   }
  });
 }
});

import {describe,it,expect} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createAutonomousFlightV2} from '../src/simulation/spaceflight/flight-v2';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {focusBody,trackBody,panFollow,updateFollow,DEFAULT_OBSERVATORY} from '../src/ui/observatory';

describe('camera debug controls and V2 liftoff',()=>{
 it('Focus zooms once, Follow keeps zoom and preserves pan offset',()=>{
  const world=generateWorld('follow-offset-test');
  const planet=world.bodies.find(b=>b.kind==='planet')!;
  const state=structuredClone(DEFAULT_OBSERVATORY),camera={x:0,y:0,zoom:1};
  expect(focusBody(camera,state,world,0,planet.id)).toBe(true);
  expect(state.follow).toBe(false);
  camera.zoom=37;
  expect(trackBody(state,world,planet.id)).toBe(true);
  updateFollow(camera,state,world,100,1);
  const x=camera.x,y=camera.y;
  panFollow(state,1e8,-2e8);updateFollow(camera,state,world,100,1);
  expect(camera.x-x).toBeCloseTo(1e8,3);
  expect(camera.y-y).toBeCloseTo(-2e8,3);
  expect(camera.zoom).toBe(37);
 });
 it('keeps thrust above local gravity at the surface',()=>{
  const world=generateWorld('thrust-floor-test');
  for(const planet of world.bodies.filter(b=>b.kind==='planet')){
   const plan=createAutonomousFlightV2(world.seed,'mission-floor',planet,0,4);
   const gravity=gravityForRadius(planet.radius);
   const g=gravity.muM3S2/(planet.radius*planet.radius);
   expect(plan.thrustN/(plan.initial.massKg*g)).toBeGreaterThanOrEqual(1.65-1e-9);
   const targetSpeed=Math.sqrt(gravity.muM3S2/(planet.radius+Math.max(100000,plan.target.periapsisAltitudeM)));
   const totalDv=plan.ispS*9.80665*Math.log(plan.initial.massKg/(plan.initial.massKg-plan.initial.fuelKg));
   expect(totalDv).toBeGreaterThanOrEqual(targetSpeed*1.65);
  }
 });
});

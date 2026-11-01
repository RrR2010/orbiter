import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {handoffToHeliocentric,planetSphereOfInfluence} from '../src/simulation/interplanetary-handoff';
import {bodyFrame,celestialState,frameOrigin,fromHeliocentricProbe,fromLocalFlight,solarFrame,toLocalFlight,transformState} from '../src/simulation/reference-frames';

const world=generateWorld('phase7-m1-reference-frames');
const planet=world.bodies.find(b=>b.kind==='planet')!;
const epochS=1_234_567;
const close=(a:number,b:number,tolerance:number):void=>expect(Math.abs(a-b)).toBeLessThanOrEqual(tolerance);
const vectorClose=(a:{x:number;y:number},b:{x:number;y:number},tolerance:number):void=>{
 close(a.x,b.x,tolerance);close(a.y,b.y,tolerance);
};

describe('phase 7 M1 reference frames',()=>{
 it('round-trips position, velocity, epoch and resources across solar and body frames',()=>{
  const local={position:{x:planet.radius+300000,y:12500},velocity:{x:-250,y:3200},
   massKg:1200,fuelKg:300,timeS:epochS};
  const original=fromLocalFlight('vehicle-1',planet.id,local);
  const solar=transformState(world,original,solarFrame);
  const restored=transformState(world,solar,bodyFrame(planet.id));
  vectorClose(restored.positionM,original.positionM,1e-5);
  vectorClose(restored.velocityMs,original.velocityMs,1e-8);
  expect(restored.epochS).toBe(epochS);
  expect(restored.entityId).toBe('vehicle-1');
  expect(toLocalFlight(restored).massKg).toBe(local.massKg);
  expect(toLocalFlight(restored).fuelKg).toBe(local.fuelKg);
  expect(transformState(world,original,original.frameId)).toEqual(original);
 });
 it('matches legacy SOI handoff without a position or velocity discontinuity',()=>{
  const radius=planetSphereOfInfluence(planet);
  const local={position:{x:radius,y:0},velocity:{x:1234,y:4321},
   massKg:2000,fuelKg:500,timeS:epochS};
  const legacy=handoffToHeliocentric(world,planet.id,local);
  const transformed=transformState(world,fromLocalFlight('probe-1',planet.id,local),solarFrame);
  vectorClose(transformed.positionM,legacy.position,1e-5);
  vectorClose(transformed.velocityMs,legacy.velocity,1e-8);
  expect(toLocalFlight(fromHeliocentricProbe('probe-1',legacy))).toEqual(legacy);
 });
 it('samples celestial bodies consistently with local frame origins',()=>{
  const star=world.bodies.find(b=>b.kind==='star')!;
  const moon=world.bodies.find(b=>b.kind==='moon')!;
  const origin=frameOrigin(world,bodyFrame(moon.id),epochS);
  const celestial=celestialState(world,moon.id,epochS);
  vectorClose(celestial.positionM,origin.positionM,1e-5);
  vectorClose(celestial.velocityMs,origin.velocityMs,1e-8);
  const moonLocal=celestialState(world,moon.id,epochS,bodyFrame(moon.id));
  vectorClose(moonLocal.positionM,{x:0,y:0},1e-5);
  vectorClose(moonLocal.velocityMs,{x:0,y:0},1e-8);
  expect(celestialState(world,star.id,epochS).positionM).toEqual({x:0,y:0});
  expect(celestial.massKg).toBeUndefined();
  expect(celestial.fuelKg).toBeUndefined();
 });
 it('rejects invalid epochs, frames, state vectors and flight resources',()=>{
  expect(()=>frameOrigin(world,solarFrame,Number.NaN)).toThrow();
  expect(()=>frameOrigin(world,'body:missing',epochS)).toThrow();
  expect(()=>transformState(world,{entityId:'x',frameId:solarFrame,epochS,
   positionM:{x:Infinity,y:0},velocityMs:{x:0,y:0}},solarFrame)).toThrow();
  expect(()=>toLocalFlight({entityId:'x',frameId:solarFrame,epochS,
   positionM:{x:0,y:0},velocityMs:{x:0,y:0}})).toThrow();
  expect(()=>fromLocalFlight('x',planet.id,{position:{x:1,y:0},velocity:{x:0,y:0},
   massKg:100,fuelKg:100,timeS:epochS})).toThrow();
 });
 it('is deterministic across repeated calls and independent of query order',()=>{
  const a=celestialState(world,planet.id,epochS);
  celestialState(world,world.bodies[0].id,epochS+100);
  const b=celestialState(world,planet.id,epochS);
  expect(a).toEqual(b);
  expect(gravityForRadius(planet.radius).muM3S2).toBeGreaterThan(0);
 });
});

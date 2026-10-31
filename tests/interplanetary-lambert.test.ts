import {describe,expect,it} from 'vitest';
import {solveLambert2D} from '../src/simulation/interplanetary-lambert';
import {propagateCoast} from '../src/simulation/spaceflight/coast';

const mu=1.32712440018e20,radius=1e11;
const speed=Math.sqrt(mu/radius),period=2*Math.PI*Math.sqrt(radius**3/mu);
const departure={x:radius,y:0};

describe('planar two-body Lambert solver',()=>{
 it('recovers a circular quarter-orbit boundary without moving the target',()=>{
  const target={x:0,y:radius},dt=period/4;
  const solved=solveLambert2D(departure,target,dt,mu);
  expect(solved).not.toBeNull();
  expect(solved!.departureVelocity.x).toBeCloseTo(0,4);
  expect(solved!.departureVelocity.y).toBeCloseTo(speed,4);
  const initial={position:departure,velocity:solved!.departureVelocity,massKg:100,fuelKg:0,timeS:0};
  const arrival=propagateCoast(initial,{radiusM:1,muM3S2:mu},dt);
  expect(Math.hypot(arrival.position.x-target.x,arrival.position.y-target.y)).toBeLessThan(100);
  expect(Math.hypot(arrival.velocity.x-solved!.arrivalVelocity.x,arrival.velocity.y-solved!.arrivalVelocity.y)).toBeLessThan(.001);
 });
 it('honors a noncircular boundary and is deterministic',()=>{
  const dt=period*.2,target={x:-.1*radius,y:.85*radius};
  const solved=solveLambert2D(departure,target,dt,mu);
  expect(solved).not.toBeNull();
  const arrival=propagateCoast({position:departure,velocity:solved!.departureVelocity,massKg:100,fuelKg:0,timeS:0},
   {radiusM:1,muM3S2:mu},dt);
  expect(Math.hypot(arrival.position.x-target.x,arrival.position.y-target.y)).toBeLessThan(1000);
  expect(solveLambert2D(departure,target,dt,mu)).toEqual(solved);
 });
 it('rejects invalid boundaries and acknowledges collinear ambiguity',()=>{
  expect(()=>solveLambert2D(departure,{x:0,y:0},100,mu)).toThrow();
  expect(()=>solveLambert2D(departure,{x:0,y:radius},-1,mu)).toThrow();
  expect(solveLambert2D(departure,{x:-radius,y:0},period/2,mu)).toBeNull();
 });
});

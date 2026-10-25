import type {Vec2} from '../orbits';
import {gravityAcceleration} from './gravity';
import type {Burn,FlightState,PlanetGravity} from './types';
const G0=9.80665;
const add=(a:Vec2,b:Vec2,s:number):Vec2=>({x:a.x+b.x*s,y:a.y+b.y*s});

/** Velocity-Verlet two-body coast step, valid only above the surface. */
export function coastStep(s:FlightState,planet:PlanetGravity,dt:number):FlightState{
 if(!Number.isFinite(dt)||dt<=0)throw new Error('Invalid step');
 const a=gravityAcceleration(s.position,planet.muM3S2);
 const p=add(add(s.position,s.velocity,dt),a,.5*dt*dt);
 const next=gravityAcceleration(p,planet.muM3S2);
 return {...s,position:p,velocity:add(s.velocity,{x:a.x+next.x,y:a.y+next.y},dt/2),timeS:s.timeS+dt};
}
/** Deterministic symplectic kick-drift with fuel-limited thrust and explicit guidance. */
export function poweredStep(s:FlightState,planet:PlanetGravity,dt:number,burn:Burn):FlightState{
 if(!Number.isFinite(dt)||dt<=0||burn.ispS<=0||burn.thrustN<0||s.massKg<=0||s.fuelKg<0||s.fuelKg>=s.massKg)throw new Error('Invalid flight input');
 const active=s.timeS>=burn.startS&&s.timeS<burn.endS;
 const used=active?Math.min(s.fuelKg,burn.thrustN*dt/(burn.ispS*G0)):0;
 const radial={x:s.position.x/Math.hypot(s.position.x,s.position.y),y:s.position.y/Math.hypot(s.position.x,s.position.y)};
 const tangential={x:-radial.y,y:radial.x};
 const progress=Math.max(0,Math.min(1,(s.timeS-burn.startS)/Math.max(1e-9,burn.endS-burn.startS)));
 const start=Math.max(0,Math.min(1,burn.progradeFraction));
 const end=Math.max(0,Math.min(1,burn.endProgradeFraction??start));
 const fraction=start+(end-start)*progress;
 const direction={x:radial.x*(1-fraction)+tangential.x*fraction,y:radial.y*(1-fraction)+tangential.y*fraction};
 const norm=Math.hypot(direction.x,direction.y),m=s.massKg-used/2;
 const g=gravityAcceleration(s.position,planet.muM3S2);
 const thrust=used>0?used*burn.ispS*G0/dt/m:0;
 const a={x:g.x+direction.x/norm*thrust,y:g.y+direction.y/norm*thrust};
 const velocity=add(s.velocity,a,dt);
 return {...s,position:add(s.position,velocity,dt),velocity,massKg:s.massKg-used,fuelKg:s.fuelKg-used,timeS:s.timeS+dt};
}
/** Fixed simulation-time grid avoids dependence on requestAnimationFrame partitioning. */
export function advancePowered(s:FlightState,planet:PlanetGravity,targetS:number,burn:Burn,stepS=1):FlightState{
 if(targetS<s.timeS||!Number.isFinite(targetS)||!(stepS>0))throw new Error('Invalid target');
 let current=s;
 while(current.timeS<targetS-1e-10){
  const next=Math.min(targetS,(Math.floor((current.timeS+1e-9)/stepS)+1)*stepS,burn.startS>current.timeS?burn.startS:Infinity,burn.endS>current.timeS?burn.endS:Infinity);
  if(next<=current.timeS)throw new Error('Unprogressive integration');
  current=poweredStep(current,planet,next-current.timeS,burn);
  if(Math.hypot(current.position.x,current.position.y)<planet.radiusM)break;
 }
 return current;
}

/** Recompute from a persistent ignition checkpoint, never from a fractional render-frame state.
 * The event scheduler stores the ignition state and requests arbitrary timestamps from it.
 * This intentionally trades CPU for exact partition invariance until step checkpoints exist.
 */
export function sampleBurnAt(ignition:FlightState,planet:PlanetGravity,targetS:number,burn:Burn,stepS=1):FlightState{
 if(targetS<ignition.timeS||!Number.isFinite(targetS)||!(stepS>0)||!Number.isFinite(stepS))throw new Error('Invalid sampling target');
 let s=ignition;
 while(s.timeS+stepS<=targetS+1e-10){
  const next=Math.min(s.timeS+stepS,targetS);
  s=poweredStep(s,planet,next-s.timeS,burn);
  if(Math.hypot(s.position.x,s.position.y)<planet.radiusM)return s;
 }
 if(targetS>s.timeS+1e-10){
  s=poweredStep(s,planet,targetS-s.timeS,burn);
 }
 return s;
}

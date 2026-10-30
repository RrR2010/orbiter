import type {FlightState,PlanetGravity} from './spaceflight/types';
import {propagateCoast} from './spaceflight/coast';
import {handoffToHeliocentric,planetSphereOfInfluence} from './interplanetary-handoff';
import type {World} from './world';

export type EscapeResult=Readonly<{localAtBoundary:FlightState;heliocentric:FlightState;elapsedS:number;soiRadiusM:number}>;

/** Propagate an unpowered, outward hyperbolic escape to a planet's sphere of influence.
 * No position is teleported: the crossing time is bracketed and bisected from the
 * actual planet-centered Kepler trajectory before transforming reference frames.
 */
export function propagatePlanetaryEscape(world:World,planetId:string,initial:FlightState,maxDurationS=365*86400):EscapeResult|null{
 const planet=world.bodies.find(body=>body.id===planetId);
 if(!planet||planet.kind!=='planet')throw new Error('Invalid escape origin');
 if(!Number.isFinite(maxDurationS)||maxDurationS<=0||!Number.isFinite(initial.timeS))throw new Error('Invalid escape interval');
 const radius=planetSphereOfInfluence(planet),mu=6.67430e-11*3500*4*Math.PI*planet.radius**3/3;
 const gravity:PlanetGravity={radiusM:planet.radius,muM3S2:mu};
 const r0=Math.hypot(initial.position.x,initial.position.y);
 const v2=initial.velocity.x**2+initial.velocity.y**2;
 const radial=(initial.position.x*initial.velocity.x+initial.position.y*initial.velocity.y)/r0;
 if(!Number.isFinite(r0)||r0<=planet.radius||r0>=radius||!Number.isFinite(v2)||radial<0||
  v2/2-mu/r0<=0||initial.massKg<=0||initial.fuelKg<0||initial.fuelKg>=initial.massKg)return null;
 // Long hyperbolic intervals can defeat the universal-variable Newton guess.
 // Retry using deterministic equal coast segments, without altering dynamics.
 const stateAt=(dt:number):FlightState=>{
  for(let segments=1;segments<=1024;segments*=2){
   try{
    let state=initial;
    const step=dt/segments;
    for(let i=0;i<segments;i++)state=propagateCoast(state,gravity,step);
    return state;
   }catch(error){
    if(!(error instanceof Error)||!error.message.startsWith('Coast solver'))throw error;
   }
  }
  throw new Error('Escape coast could not converge within segmentation budget');
 };
 let lo=0,hi=Math.min(3600,maxDurationS);
 // A monotonically outgoing hyperbola eventually crosses the SOI. Bound work.
 while(Math.hypot(stateAt(hi).position.x,stateAt(hi).position.y)<radius){
  if(hi>=maxDurationS)return null;
  lo=hi;hi=Math.min(hi*2,maxDurationS);
 }
 for(let i=0;i<56;i++){
  const mid=(lo+hi)/2,p=stateAt(mid).position;
  if(Math.hypot(p.x,p.y)>=radius)hi=mid;else lo=mid;
 }
 const atBoundary=stateAt(hi);
 return {localAtBoundary:atBoundary,heliocentric:handoffToHeliocentric(world,planetId,atBoundary),elapsedS:hi,soiRadiusM:radius};
}

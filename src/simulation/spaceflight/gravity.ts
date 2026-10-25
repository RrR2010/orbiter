import type {Vec2} from '../orbits';
import type {PlanetGravity} from './types';

export const GRAVITATIONAL_CONSTANT=6.67430e-11;
const PLANET_DENSITY_KGM3=3500;

/** Versioned constant-density approximation; never alters preexisting planetary Kepler elements. */
export function gravityForRadius(radiusM:number):PlanetGravity{
 if(!Number.isFinite(radiusM)||radiusM<=0)throw new Error('Invalid planetary radius');
 return {radiusM,muM3S2:GRAVITATIONAL_CONSTANT*PLANET_DENSITY_KGM3*4*Math.PI*radiusM**3/3};
}
export function gravityAcceleration(position:Vec2,muM3S2:number):Vec2{
 const r=Math.hypot(position.x,position.y);
 if(!(r>0)||!Number.isFinite(muM3S2)||muM3S2<=0)throw new Error('Invalid gravity input');
 const k=-muM3S2/r**3;
 return {x:position.x*k,y:position.y*k};
}

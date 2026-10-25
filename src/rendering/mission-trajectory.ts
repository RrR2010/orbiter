import type {Vec2} from '../simulation/orbits';
import type {Mission} from '../simulation/civilization';

/** Immutable ascent path from the authoritative V2 event checkpoints. */
const cache=new WeakMap<object,readonly Vec2[]>();
export function poweredTrack(mission:Mission,_radiusM:number):readonly Vec2[]{
 const flight=mission.flight;if(!flight)return [];
 let points=cache.get(flight);if(!points){points=flight.checkpoints.map(c=>c.state.position);cache.set(flight,points);}
 return points;
}

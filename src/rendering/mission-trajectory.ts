import type {Vec2} from '../simulation/orbits';
import type {Mission} from '../simulation/civilization';

/** Immutable ascent path from the authoritative V2 event checkpoints. */
export function poweredTrack(mission:Mission,_radiusM:number):readonly Vec2[]{
 return mission.flight?.checkpoints.filter(c=>c.timeS<=mission.flight!.terminal.timeS).map(c=>c.state.position)??[];
}

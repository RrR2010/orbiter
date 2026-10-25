import type {Mission} from '../simulation/civilization';
import {flightAt} from '../simulation/spaceflight/flight';
import {gravityForRadius} from '../simulation/spaceflight/gravity';
import {propagateCoast} from '../simulation/spaceflight/coast';
import type {FlightSnapshot} from '../simulation/spaceflight/flight';

/** Physics-derived read model: burn checkpoints are cached by plan identity, never by frame time. */
const checkpoints=new WeakMap<object,FlightSnapshot>();
const samples=new WeakMap<object,Map<number,FlightSnapshot>>();
export function flightViewAt(mission:Mission,radiusM:number,time:number):FlightSnapshot|null{
 const plan=mission.flight;if(!plan)return null;
 const planet=gravityForRadius(radiusM),end=plan.insertionEndS;
 if(time>end){
  let checkpoint=checkpoints.get(plan);
  if(!checkpoint){checkpoint=flightAt(plan,planet,end);checkpoints.set(plan,checkpoint);}
  if(checkpoint.impacted||checkpoint.phase==='failure')return checkpoint;
  const state=propagateCoast(checkpoint.state,planet,time-end);
  return {...checkpoint,state,phase:'coast'};
 }
 const t=Math.max(plan.ignitionS,time);
 // Cache integer snapshots to avoid reintegrating all preceding burn steps each frame.
 const tick=Math.floor(t-plan.ignitionS);
 let cache=samples.get(plan);
 if(!cache){cache=new Map();samples.set(plan,cache);}
 let full=cache.get(tick);
 if(!full){full=flightAt(plan,planet,plan.ignitionS+tick);cache.set(tick,full);if(cache.size>4)cache.delete(cache.keys().next().value!);}
 if(t-plan.ignitionS===tick)return full;
 // Fractional time is recomputed from immutable ignition checkpoint for precision.
 return flightAt(plan,planet,t);
}

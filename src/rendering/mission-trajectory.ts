import type {Vec2} from '../simulation/orbits';
import type {Mission} from '../simulation/civilization';
import {gravityForRadius} from '../simulation/spaceflight/gravity';
import {flightAt} from '../simulation/spaceflight/flight';

/** Cached, physically sampled burn track in planet-relative SI coordinates. */
const tracks=new WeakMap<object,readonly Vec2[]>();
export function poweredTrack(mission:Mission,radiusM:number):readonly Vec2[]{
 const plan=mission.flight;
 if(!plan)return [];
 const cached=tracks.get(plan);if(cached)return cached;
 const planet=gravityForRadius(radiusM),points:Vec2[]=[];
 const count=48;
 for(let i=0;i<=count;i++){
  const t=plan.ignitionS+(plan.insertionEndS-plan.ignitionS)*i/count;
  const sample=flightAt(plan,planet,t);
  points.push(sample.state.position);
  if(sample.impacted)break;
 }
 tracks.set(plan,points);
 return points;
}

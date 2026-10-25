import {positionsAt,type World} from '../simulation/world';
import {flightAt} from '../simulation/spaceflight/flight';
import {gravityForRadius} from '../simulation/spaceflight/gravity';
import type {Civilization,Mission} from '../simulation/civilization';
import type {Vec2} from '../simulation/orbits';

export type MissionSymbol={mission:Mission;position:Vec2;physical:boolean;state:'ascent'|'orbiting'|'legacy'};
/** Read-only mission locations in SI. Legacy records retain their old illustrative positions. */
export function missionSymbols(world:World,c:Civilization,time:number):MissionSymbol[]{
 const home=positionsAt(world,time).get(c.homeId),planet=world.bodies.find(b=>b.id===c.homeId);
 if(!home||!planet)return [];
 const gravity=gravityForRadius(planet.radius);
 return c.missions.slice(-12).filter(m=>m.status==='ascending'||m.status==='success').map(m=>{
  if(m.flight){
   // Never re-integrate huge coast intervals per frame for non-orbital failures.
   const sampled=flightAt(m.flight,gravity,Math.max(m.flight.ignitionS,Math.min(time,m.resolvedAt||time)));
   return {mission:m,position:{x:home.x+sampled.state.position.x,y:home.y+sampled.state.position.y},physical:true,state:m.status==='success'?'orbiting':'ascent'};
  }
  const angle=(m.startedAt/1000+time/5400+Number(m.id.split('-')[1]))*2*Math.PI;
  const offset=planet.radius*1.25;
  return {mission:m,position:{x:home.x+Math.cos(angle)*offset,y:home.y+Math.sin(angle)*offset},physical:false,state:'legacy'};
 });
}

import {positionsAt,type World} from '../simulation/world';
import {flightViewAt} from './flight-view';
import type {FlightState} from '../simulation/spaceflight/types';
import type {Civilization,Mission} from '../simulation/civilization';
import type {Vec2} from '../simulation/orbits';

export type MissionSymbol={mission:Mission;position:Vec2;physical:boolean;flightState?:FlightState;state:'ascent'|'orbiting'|'legacy'};
/** Read-only mission locations in SI. Legacy records retain their old illustrative positions. */
export function missionSymbols(world:World,c:Civilization,time:number):MissionSymbol[]{
 const home=positionsAt(world,time).get(c.homeId),planet=world.bodies.find(b=>b.id===c.homeId);
 if(!home||!planet)return [];
 return c.missions.slice(-12).filter(m=>m.status==='ascending'||m.status==='success').map(m=>{
  if(m.flight){
   const sampled=flightViewAt(m,planet.radius,Math.max(m.flight.ignitionS,time));
   if(!sampled)return {mission:m,position:home,physical:false,state:'legacy' as const};
   return {mission:m,position:{x:home.x+sampled.state.position.x,y:home.y+sampled.state.position.y},physical:true,flightState:sampled.state,state:m.status==='success'?'orbiting':'ascent'};
  }
  const angle=(m.startedAt/1000+time/5400+Number(m.id.split('-')[1]))*2*Math.PI;
  const offset=planet.radius*1.25;
  return {mission:m,position:{x:home.x+Math.cos(angle)*offset,y:home.y+Math.sin(angle)*offset},physical:false,state:'legacy'};
 });
}

import {positionsAt,type World} from '../simulation/world';
import type {Civilization,Mission} from '../simulation/civilization';
import type {Vec2} from '../simulation/orbits';

/** Symbol positions are illustrative screen offsets, not physically propagated orbits. */
export function missionSymbols(world:World,c:Civilization,time:number):{mission:Mission;home:Vec2;angle:number;radiusPx:number}[]{
 const home=positionsAt(world,time).get(c.homeId);
 if(!home)return [];
 return c.missions.slice(-12).filter(m=>m.status==='ascending'||m.status==='success').map(m=>({
  mission:m,home,angle:(m.startedAt/1000+time/5400+Number(m.id.split('-')[1]))*2*Math.PI,
  radiusPx:m.status==='ascending'?15:23+Number(m.id.split('-')[1])%4*4
 }));
}

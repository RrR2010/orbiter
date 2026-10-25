import {projectPoint} from './camera';
import {missionSymbols} from './mission-symbols';
import type {Camera} from './canvas';
import type {Civilization} from '../simulation/civilization';
import type {World} from '../simulation/world';

/** Screen-space hit testing matches renderer's intentionally illustrative symbols. */
export function pickMission(world:World,c:Civilization,time:number,camera:Readonly<Camera>,width:number,height:number,x:number,y:number):string|null{
 let selected:string|null=null,best=12;
 for(const symbol of missionSymbols(world,c,time)){
  const p=projectPoint(symbol.home,camera,width,height);
  const d=Math.hypot(x-p.x-Math.cos(symbol.angle)*symbol.radiusPx,y-p.y-Math.sin(symbol.angle)*symbol.radiusPx);
  if(d<best){best=d;selected=symbol.mission.id;}
 }
 return selected;
}

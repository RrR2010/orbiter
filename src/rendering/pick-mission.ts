import {projectPoint} from './camera';
import {missionSymbols} from './mission-symbols';
import type {Camera} from './canvas';
import type {Civilization} from '../simulation/civilization';
import type {World} from '../simulation/world';

/** Screen-space hit testing matches renderer's intentionally illustrative symbols. */
export function pickMission(world:World,c:Civilization,time:number,camera:Readonly<Camera>,width:number,height:number,x:number,y:number):string|null{
 let selected:string|null=null,best=12;
 for(const symbol of missionSymbols(world,c,time)){
  const p=projectPoint(symbol.position,camera,width,height);
  const d=Math.hypot(x-p.x,y-p.y);
  if(d<best){best=d;selected=symbol.mission.id;}
 }
 return selected;
}

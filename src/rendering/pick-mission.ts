import {projectPoint} from './camera';
import {createStateProvider,localVehicleEntityId,probeEntityId} from '../ui/state-provider';
import {solarFrame} from '../simulation/reference-frames';
import {missionSymbols} from './mission-symbols';
import {interplanetaryProbeSymbols} from './interplanetary-probe-symbols';
import type {Camera} from './canvas';
import type {Civilization} from '../simulation/civilization';
import type {World} from '../simulation/world';

/** Screen-space hit testing matches renderer's intentionally illustrative symbols. */
export function pickMission(world:World,c:Civilization,time:number,camera:Readonly<Camera>,width:number,height:number,x:number,y:number):string|null{
 let selected:string|null=null,best=12;
 const provider=createStateProvider(world,c);
 for(const symbol of missionSymbols(world,c,time)){
  const position=provider.at(localVehicleEntityId(symbol.mission.id),time,solarFrame)?.positionM??symbol.position;
  const p=projectPoint(position,camera,width,height);
  const d=Math.hypot(x-p.x,y-p.y);
  if(d<best){best=d;selected=symbol.mission.id;}
 }
 for(const probe of interplanetaryProbeSymbols(c,time,world)){
  const position=provider.at(probeEntityId(probe.missionId),time,solarFrame)?.positionM;
  if(!position)continue;
  const p=projectPoint(position,camera,width,height);
  const distance=Math.hypot(x-p.x,y-p.y);
  if(distance<best){best=distance;selected=probe.missionId;}
 }
 return selected;
}

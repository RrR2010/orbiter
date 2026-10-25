import {positionsAt,type World} from '../simulation/world';
import {projectPoint} from './camera';
import type {Camera} from './canvas';

/** Select visible rendered bodies, preferring the nearest screen-space candidate. */
export function pickBody(world:World,time:number,camera:Readonly<Camera>,width:number,height:number,x:number,y:number):string|null{
  const positions=positionsAt(world,time);
  let best:string|null=null,score=Infinity;
  for(const body of world.bodies){
    const position=positions.get(body.id);if(!position)continue;
    const p=projectPoint(position,camera,width,height);
    const distance=Math.hypot(p.x-x,p.y-y);
    const radius=body.kind==='star'?15:body.kind==='moon'?9:12;
    if(distance<=radius&&distance<score){score=distance;best=body.id;}
  }
  return best;
}

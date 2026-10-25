import {positionsAt,type World} from '../simulation/world';
import {cameraScale,projectPoint} from './camera';
import type {Camera} from './canvas';

/** Hit-test the *rendered* disc, including high-zoom planetary surfaces. */
export function pickBody(world:World,time:number,camera:Readonly<Camera>,width:number,height:number,x:number,y:number):string|null{
 const positions=positionsAt(world,time),scale=cameraScale(width,height,camera);
 let best:string|null=null,score=Infinity;
 for(const body of world.bodies){
  const position=positions.get(body.id);if(!position)continue;
  const p=projectPoint(position,camera,width,height);
  const radius=body.kind==='star'?10:body.kind==='moon'?Math.max(2,body.radius*scale):Math.max(3,body.radius*scale);
  const hitRadius=Math.max(10,radius);
  const distance=Math.hypot(p.x-x,p.y-y);
  if(distance>hitRadius)continue;
  // Prefer a visible small foreground body over a huge planet behind it.
  const normalized=distance/hitRadius;
  const candidate=radius>20?normalized+0.15:normalized;
  if(candidate<score){score=candidate;best=body.id;}
 }
 return best;
}

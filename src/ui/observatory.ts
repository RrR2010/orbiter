import {AU,positionsAt,type Body,type World} from '../simulation/world';
import {orbitalPosition} from '../simulation/orbits';
import type {Camera} from '../rendering/canvas';

export type Layers = {orbits:boolean;labels:boolean;belt:boolean};
export const DEFAULT_LAYERS:Layers={orbits:true,labels:true,belt:true};
export type ObservatoryState={selectedId:string|null;follow:boolean;layers:Layers;ambient:boolean;cameraSpeed:number};
export const DEFAULT_OBSERVATORY:ObservatoryState={selectedId:null,follow:false,layers:{...DEFAULT_LAYERS},ambient:false,cameraSpeed:3};
export const OBSERVATORY_KEY='orbiter.observatory.v1';
export function parseObservatory(raw:string|null):ObservatoryState{
  if(!raw)return structuredClone(DEFAULT_OBSERVATORY);
  try{
    const value:unknown=JSON.parse(raw);
    if(!value||typeof value!=='object')return structuredClone(DEFAULT_OBSERVATORY);
    const v=value as Partial<ObservatoryState>,l=v.layers;
    if(typeof v.follow!=='boolean'||typeof v.ambient!=='boolean'||!(v.selectedId===null||typeof v.selectedId==='string')||!l||typeof l.orbits!=='boolean'||typeof l.labels!=='boolean'||typeof l.belt!=='boolean')return structuredClone(DEFAULT_OBSERVATORY);
    return {selectedId:v.selectedId,follow:v.follow,layers:{orbits:l.orbits,labels:l.labels,belt:l.belt},ambient:v.ambient,cameraSpeed:typeof v.cameraSpeed==='number'&&[1,3,7,20].includes(v.cameraSpeed)?v.cameraSpeed:3};
  }catch{return structuredClone(DEFAULT_OBSERVATORY);}
}
export function selectBody(state:ObservatoryState,world:World,id:string|null):void{
  state.selectedId=id&&world.bodies.some(b=>b.id===id)?id:null;
  state.follow=false;
}
export function focusBody(camera:Camera,state:ObservatoryState,world:World,time:number,id:string):boolean{
  const body=world.bodies.find(b=>b.id===id);
  if(!body)return false;
  if(!positionsAt(world,time).has(id))return false;
  state.selectedId=id;state.follow=true;
  return true;
}
export function updateFollow(camera:Camera,state:ObservatoryState,world:World,time:number,elapsed=1):void{
  if(!state.follow||!state.selectedId)return;
  const target=positionsAt(world,time).get(state.selectedId);
  if(!target){state.follow=false;return;}
  const body=world.bodies.find(b=>b.id===state.selectedId);const reference=body?.orbit?.semiMajorAxis;
  const zoom=reference?Math.max(.035,Math.min(20000,body?.kind==='moon'?8*AU/reference:2*AU/reference)):1;
  const factor=1-Math.exp(-state.cameraSpeed*Math.max(0,elapsed));
  camera.x+=(target.x-camera.x)*factor;camera.y+=(target.y-camera.y)*factor;
  camera.zoom*=Math.exp((Math.log(zoom)-Math.log(camera.zoom))*factor);
}
export function resetView(camera:Camera,state:ObservatoryState):void{
  state.follow=false;camera.x=0;camera.y=0;camera.zoom=1;
}
export function orbitalSpeed(body:Body,time:number):number|null{
  const o=body.orbit;if(!o)return null;
  const {x,y}=orbitalPosition(o,time),r=Math.hypot(x,y),mu=4*Math.PI*Math.PI*o.semiMajorAxis**3/o.period**2;
  return Math.sqrt(mu*(2/r-1/o.semiMajorAxis));
}
export function bodyTelemetry(body:Body,world:World,time:number){
  const p=positionsAt(world,time),absolute=p.get(body.id),parent=body.parentId?p.get(body.parentId):undefined;
  const distance=absolute&&parent?Math.hypot(absolute.x-parent.x,absolute.y-parent.y):null;
  return {radius:body.radius,semiMajorAxis:body.orbit?.semiMajorAxis??null,eccentricity:body.orbit?.eccentricity??null,period:body.orbit?.period??null,distance,speed:orbitalSpeed(body,time)};
}
export function distanceLabel(m:number|null):string{
  if(m===null)return '—';if(m>=.01*AU)return (m/AU).toFixed(3)+' AU';
  return (m/1000).toLocaleString('pt-BR',{maximumFractionDigits:0})+' km';
}
export function timeLabel(seconds:number|null):string{
  if(seconds===null)return '—';return seconds>=86400?(seconds/86400).toFixed(2)+' dias':(seconds/3600).toFixed(2)+' h';
}

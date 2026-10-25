import {AU} from '../simulation/world';
import type {Camera} from './canvas';
import type {Vec2} from '../simulation/orbits';

/** Metres-to-pixels projection shared by rendering and deterministic hit testing. */
export function cameraScale(width:number,height:number,camera:Readonly<Camera>):number{
  return Math.min(width,height)/(12*AU)*camera.zoom;
}
export function projectPoint(point:Vec2,camera:Readonly<Camera>,width:number,height:number):Vec2{
  const scale=cameraScale(width,height,camera);
  return {x:width/2+(point.x-camera.x)*scale,y:height/2+(point.y-camera.y)*scale};
}
export function unprojectPoint(point:Vec2,camera:Readonly<Camera>,width:number,height:number):Vec2{
  const scale=cameraScale(width,height,camera);
  return {x:(point.x-width/2)/scale+camera.x,y:(point.y-height/2)/scale+camera.y};
}

import type {MissionTimeline} from '../simulation/interplanetary-mission-timeline';
import {formatSimulatedTime} from './time';

/** Show simulation epochs and a readable countdown without implying launch occurred. */
export function interplanetaryScheduleLabels(timeline:MissionTimeline,nowS:number):Readonly<{
 departure:string;arrival:string;countdown:string;travel:string;
}>{
 const {departureS,arrivalS}=timeline.manifest;
 const duration=(seconds:number):string=>{
  const d=Math.floor(seconds/86400),h=Math.floor(seconds%86400/3600);
  return d>0?d+' d '+h+' h':Math.max(0,Math.ceil(seconds/3600))+' h';
 };
 return {
  departure:formatSimulatedTime(departureS),
  arrival:formatSimulatedTime(arrivalS),
  countdown:nowS<departureS?'T−'+duration(departureS-nowS):'Partida realizada',
  travel:duration(arrivalS-departureS)
 };
}

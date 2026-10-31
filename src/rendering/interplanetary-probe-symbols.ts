import type {Civilization} from '../simulation/civilization';
import {interplanetaryMissionView,type InterplanetaryMissionPhase} from '../simulation/interplanetary-mission-view';
import {propagateCoast} from '../simulation/spaceflight/coast';
import type {FlightState} from '../simulation/spaceflight/types';
import type {Vec2} from '../simulation/orbits';

const SOLAR_GRAVITY={radiusM:1,muM3S2:1.32712440018e20};
export type InterplanetaryProbeSymbol=Readonly<{
 missionId:string;originId:string;targetId:string;
 position:Vec2;state:FlightState;phase:InterplanetaryMissionPhase;
}>;

/** Render physical heliocentric coast before and after the correction.
 * The departure-to-SOI escape leg remains unrendered without its planetary patch.
 */
export function interplanetaryProbeSymbols(c:Readonly<Civilization>,timeS:number):InterplanetaryProbeSymbol[]{
 if(!Number.isFinite(timeS)||timeS<0)throw new Error('Invalid probe display time');
 return (c.interplanetaryTimelines??[]).flatMap(timeline=>{
  const {manifest}=timeline,corrected=manifest.correctedCoastStart;
  if(!corrected||timeS>manifest.arrivalS||timeline.cursor===0)return [];
  const view=interplanetaryMissionView(timeline);
  if(view.phase==='scheduled')return [];
  const origin=timeS<corrected.timeS?manifest.preCorrectionCoastStart:corrected;
  if(!origin||timeS<origin.timeS)return [];
  const state=propagateCoast(origin,SOLAR_GRAVITY,timeS-origin.timeS);
  return [{missionId:timeline.missionId,originId:manifest.originId,
   targetId:manifest.targetId,position:state.position,state,phase:view.phase}];
 });
}

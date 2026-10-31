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

/** Render a probe only on the physically defined corrected coast leg.
 * Earlier departure/SOI flight needs its own saved conic patch; never draw
 * a fabricated straight line between planets.
 */
export function interplanetaryProbeSymbols(c:Readonly<Civilization>,timeS:number):InterplanetaryProbeSymbol[]{
 if(!Number.isFinite(timeS)||timeS<0)throw new Error('Invalid probe display time');
 return (c.interplanetaryTimelines??[]).flatMap(timeline=>{
  const {manifest}=timeline,origin=manifest.correctedCoastStart;
  if(!origin||timeS<origin.timeS||timeS>manifest.arrivalS||
   timeline.cursor===0)return [];
  const view=interplanetaryMissionView(timeline);
  if(view.phase==='scheduled'||view.phase==='coasting')return [];
  const state=propagateCoast(origin,SOLAR_GRAVITY,timeS-origin.timeS);
  return [{missionId:timeline.missionId,originId:manifest.originId,
   targetId:manifest.targetId,position:state.position,state,phase:view.phase}];
 });
}

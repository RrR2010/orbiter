import type {Civilization} from '../simulation/civilization';
import {interplanetaryMissionView,type InterplanetaryMissionPhase} from '../simulation/interplanetary-mission-view';
import {propagateCoast} from '../simulation/spaceflight/coast';
import {gravityForRadius} from '../simulation/spaceflight/gravity';
import {positionsAt,type World} from '../simulation/world';
import {planetaryVelocityAt} from '../simulation/interplanetary-handoff';
import type {FlightState} from '../simulation/spaceflight/types';
import type {Vec2} from '../simulation/orbits';

const SOLAR_GRAVITY={radiusM:1,muM3S2:1.32712440018e20};
export type InterplanetaryProbeSymbol=Readonly<{
 missionId:string;originId:string;targetId:string;
 position:Vec2;state:FlightState;phase:InterplanetaryMissionPhase;
}>;

/** Render physical heliocentric coast before and after the correction.
 * A supplied world also enables the physical planet-centered escape segment.
 */
export function interplanetaryProbeSymbols(c:Readonly<Civilization>,timeS:number,world?:World):InterplanetaryProbeSymbol[]{
 if(!Number.isFinite(timeS)||timeS<0)throw new Error('Invalid probe display time');
 return (c.interplanetaryTimelines??[]).flatMap(timeline=>{
  const {manifest}=timeline,corrected=manifest.correctedCoastStart;
  if(!corrected||timeline.cursor===0)return [];
  const view=interplanetaryMissionView(timeline);
  if(view.phase==='scheduled')return [];
  const escape=manifest.planetaryEscapeStart,solar=manifest.preCorrectionCoastStart;
  if(escape&&solar&&timeS<solar.timeS){
   if(!world||timeS<escape.timeS)return [];
   const home=world.bodies.find(b=>b.id===manifest.originId);
   if(!home||home.kind!=='planet')return [];
   let local:FlightState=escape;
   const dt=timeS-escape.timeS;
   // Hyperbolic Kepler propagation may need subdivision for convergence.
   if(dt>0){
    let solved=false;
    for(let segments=1;segments<=1024;segments*=2){
     try{
      local=escape;
      for(let i=0;i<segments;i++)local=propagateCoast(local,gravityForRadius(home.radius),dt/segments);
      solved=true;break;
     }catch(error){
      if(!(error instanceof Error)||!error.message.startsWith('Coast solver'))throw error;
     }
    }
    if(!solved)return [];
   }
   const center=positionsAt(world,timeS).get(home.id);
   if(!center)return [];
   const planetVelocity=planetaryVelocityAt(home,timeS);
   const state={...local,position:{x:center.x+local.position.x,y:center.y+local.position.y},
    velocity:{x:planetVelocity.x+local.velocity.x,y:planetVelocity.y+local.velocity.y}};
   return [{missionId:timeline.missionId,originId:manifest.originId,
    targetId:manifest.targetId,position:state.position,state,phase:view.phase}];
  }
  const origin=timeS<corrected.timeS?solar:corrected;
  if(!origin||timeS<origin.timeS)return [];
  const state=propagateCoast(origin,SOLAR_GRAVITY,timeS-origin.timeS);
  return [{missionId:timeline.missionId,originId:manifest.originId,
   targetId:manifest.targetId,position:state.position,state,phase:view.phase}];
 });
}

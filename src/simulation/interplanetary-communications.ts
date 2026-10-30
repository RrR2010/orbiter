import {orbitalPosition,type Vec2} from './orbits';
import type {World} from './world';

export const LIGHT_SPEED_MS=299792458;
export type ScienceTransmission=Readonly<{
 observationAtS:number;receivedAtS:number;distanceM:number;signalTravelS:number;
 originId:string;targetId:string;
}>;

/** Calculate the earliest reception of a planetary flyby measurement at the homeworld.
 * The signal follows a straight line at c from the probe location at emission;
 * the receiving planet moves along its orbit during signal propagation.
 * A bounded fixed-point solution accounts for that receiver motion.
 * This is a propagation delay only, not a model of link budget or reliability.
 */
export function scheduleScienceTransmission(
 world:World,originId:string,targetId:string,probePosition:Vec2,observationAtS:number,
):ScienceTransmission{
 const home=world.bodies.find(body=>body.id===originId);
 const target=world.bodies.find(body=>body.id===targetId);
 if(!home?.orbit||home.kind!=='planet'||!target?.orbit||target.kind!=='planet'||
  home.id===target.id||!Number.isFinite(observationAtS)||observationAtS<0||
  !Number.isFinite(probePosition.x)||!Number.isFinite(probePosition.y))
  throw new Error('Invalid science transmission');
 let receivedAtS=observationAtS;
 let distanceM=0;
 for(let i=0;i<24;i++){
  const position=orbitalPosition(home.orbit,receivedAtS);
  distanceM=Math.hypot(position.x-probePosition.x,position.y-probePosition.y);
  const next=observationAtS+distanceM/LIGHT_SPEED_MS;
  if(Math.abs(next-receivedAtS)<1e-8){receivedAtS=next;break;}
  receivedAtS=next;
 }
 const receiverPosition=orbitalPosition(home.orbit,receivedAtS);
 distanceM=Math.hypot(receiverPosition.x-probePosition.x,receiverPosition.y-probePosition.y);
 receivedAtS=observationAtS+distanceM/LIGHT_SPEED_MS;
 return {observationAtS,receivedAtS,distanceM,signalTravelS:receivedAtS-observationAtS,originId,targetId};
}

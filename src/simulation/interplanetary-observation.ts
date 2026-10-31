import {seededRandom} from '../core/random';
import {gravityForRadius} from './spaceflight/gravity';
import {propagateCoast} from './spaceflight/coast';
import {scheduleScienceTransmission} from './interplanetary-communications';
import {assessPlanetaryApproach} from './interplanetary-approach';
import type {ContinuousTransfer} from './interplanetary-continuous-transfer';
import type {PendingScience} from './interplanetary-science-inbox';
import type {World} from './world';

/** Prepare a sensor observation from a measured positive-altitude flyby.
 * The seed only models instrument noise; authoritative planetary gravity never
 * changes and the scientific record is updated only at signal reception.
 */
export function scienceFromPhysicalFlyby(
 world:World,originId:string,targetId:string,missionId:string,transfer:ContinuousTransfer,
):PendingScience|null{
 const target=world.bodies.find(body=>body.id===targetId);
 if(!target||target.kind!=='planet'||!target.orbit||!missionId)return null;
 if(assessPlanetaryApproach(transfer,target).outcome!=='flyby')return null;
 const observationAtS=transfer.closestTimeS;
 const position=propagateCoast(transfer.escape.heliocentric,{radiusM:1,muM3S2:1.32712440018e20},
  observationAtS-transfer.escape.heliocentric.timeS).position;
 const gravity=gravityForRadius(target.radius).muM3S2/(target.radius*target.radius);
 const random=seededRandom('orbiter:flyby:sensor:v1:'+world.seed+':'+missionId+':'+targetId);
 const relativeError=.05+random()*.10;
 const measuredGravity=gravity*(1+(random()*2-1)*relativeError);
 const observation={bodyId:targetId,observationId:missionId+':gravity:'+targetId,
  measuredGravity,relativeError,transmitted:true};
 return {observation,transmission:scheduleScienceTransmission(world,originId,targetId,position,observationAtS)};
}

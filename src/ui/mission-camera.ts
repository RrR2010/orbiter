import {AU,positionsAt,type World} from '../simulation/world';
import {homeLaunchSite,sitePosition} from '../simulation/spaceflight/surface-site';
import type {Mission} from '../simulation/civilization';
import type {Vec2} from '../simulation/orbits';

/** Absolute deterministic launch-pad position, never the planet centre. */
export function launchPadPosition(world:World,mission:Mission,timeS:number):Vec2|null{
 const body=world.bodies.find(b=>b.id===mission.originId);
 const origin=positionsAt(world,timeS).get(mission.originId);
 if(!body||!origin||body.kind!=='planet')return null;
 const local=mission.flight?.plan.initial.position??sitePosition(homeLaunchSite(world.seed,body.id),body.radius);
 return {x:origin.x+local.x,y:origin.y+local.y};
}

/** Local launch framing, with the planet limb visible at typical desktop sizes. */
export function launchCameraZoom(planetRadiusM:number,viewportShortSidePx:number):number{
 if(!(planetRadiusM>0)||!(viewportShortSidePx>0))return 1;
 return Math.max(.035,Math.min(2_000_000,125*12*AU/(viewportShortSidePx*planetRadiusM)));
}

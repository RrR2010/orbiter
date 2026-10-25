import {seededRandom} from '../../core/random';
import type {Vec2} from '../orbits';

export type SurfaceSite=Readonly<{id:string;planetId:string;longitudeRad:number;altitudeM:number}>;
/** Stable site per seed and homeworld: independent of mission generation and archive order. */
export function homeLaunchSite(seed:string,planetId:string):SurfaceSite{
 const rng=seededRandom('orbiter:surface-site:v1:'+seed+':'+planetId);
 return {id:'site-0',planetId,longitudeRad:rng()*Math.PI*2,altitudeM:10};
}
export function sitePosition(site:SurfaceSite,radiusM:number):Vec2{
 const radius=radiusM+site.altitudeM;
 return {x:radius*Math.cos(site.longitudeRad),y:radius*Math.sin(site.longitudeRad)};
}

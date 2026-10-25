import type {Vec2} from '../simulation/orbits';
import {analyzeTrajectory} from '../simulation/spaceflight/conics';
import type {FlightState,PlanetGravity} from '../simulation/spaceflight/types';

export type PredictedOrbit=Readonly<{points:readonly Vec2[];closed:boolean;periapsisM:number;apoapsisM:number|null;impactRisk:boolean;apoapsisPoint:Vec2;periapsisPoint:Vec2|null}>;

/** Sample an osculating ellipse in SI without advancing simulation or mutating the vehicle.
 * Surface-intersecting sections are omitted, so a suborbital path ends at the surface.
 */
export function predictLocalOrbit(state:FlightState,planet:PlanetGravity,segments=96):PredictedOrbit|null{
 const orbit=analyzeTrajectory(state,planet);
 if(orbit.kind!=='elliptic'||orbit.semiMajorAxisM===null||orbit.apoapsisM===null||!Number.isSafeInteger(segments)||segments<12||segments>512)return null;
 const {position:r,velocity:v}=state,mu=planet.muM3S2,h=r.x*v.y-r.y*v.x,d=Math.hypot(r.x,r.y);
 const ex=v.y*h/mu-r.x/d,ey=-v.x*h/mu-r.y/d;
 const angle=orbit.eccentricity>1e-9?Math.atan2(ey,ex):Math.atan2(r.y,r.x);
 const cos=Math.cos(angle),sin=Math.sin(angle),a=orbit.semiMajorAxisM,e=orbit.eccentricity,b=a*Math.sqrt(1-e*e);
 const points:Vec2[]=[];
 for(let i=0;i<=segments;i++){
  const anomaly=i/segments*2*Math.PI;
  const px=a*(Math.cos(anomaly)-e),py=b*Math.sin(anomaly);
  const p={x:px*cos-py*sin,y:px*sin+py*cos};
  points.push(Math.hypot(p.x,p.y)>planet.radiusM?p:{x:NaN,y:NaN});
 }
 return {points,closed:!orbit.surfaceIntersecting,periapsisM:orbit.periapsisM,apoapsisM:orbit.apoapsisM,impactRisk:orbit.surfaceIntersecting,apoapsisPoint:{x:-orbit.apoapsisM*cos,y:-orbit.apoapsisM*sin},periapsisPoint:orbit.periapsisM>planet.radiusM?{x:orbit.periapsisM*cos,y:orbit.periapsisM*sin}:null};
}

import {seededRandom} from '../../core/random';
export type MissionObjective='suborbitalSurvey'|'lowOrbit'|'ellipticalSurvey'|'highApoapsis'|'orbitAndReturn';
export type MissionTarget=Readonly<{objective:MissionObjective;periapsisAltitudeM:number;apoapsisAltitudeM:number;launchWindowS:number;plannedEndS:number|null}>;
const sequence:readonly MissionObjective[]=['suborbitalSurvey','lowOrbit','ellipticalSurvey','lowOrbit','highApoapsis','orbitAndReturn'];
/** Intent is defined before ignition; reaching it remains a consequence of the flight engine. */
export function planMissionObjective(seed:string,id:string,radiusM:number,ignitionS:number,tier:number):MissionTarget{
 const rng=seededRandom('orbiter:objective:v1:'+seed+':'+id);
 const objective=sequence[Math.floor(rng()*sequence.length)];
 const low=Math.max(60000,radiusM*.025);
 const high=low*(1.5+rng()*3);
 const apo=objective==='highApoapsis'?radiusM*(.2+rng()*.8):objective==='ellipticalSurvey'?high:low*(1.1+rng()*.5);
 const peri=objective==='suborbitalSurvey'?-radiusM*.2:objective==='orbitAndReturn'?low:low*(.9+rng()*.5);
 const duration=objective==='orbitAndReturn'?(tier+1)*86400:null;
 return {objective,periapsisAltitudeM:peri,apoapsisAltitudeM:apo,launchWindowS:ignitionS,plannedEndS:duration===null?null:ignitionS+duration};
}

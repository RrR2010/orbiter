import type {Mission} from '../simulation/civilization';
import {gravityForRadius} from '../simulation/spaceflight/gravity';
import {analyzeTrajectory} from '../simulation/spaceflight/conics';
import {sampleAutonomousFlightWithPlanet} from '../simulation/spaceflight/flight-v2';
import type {FlightState} from '../simulation/spaceflight/types';
import type {Trajectory} from '../simulation/spaceflight/types';

type FlightSnapshot=Readonly<{state:FlightState;orbit:Trajectory;phase:'ascent'|'insertion'|'coast'|'circularization'|'impact'|'failure';impacted:boolean}>;

/** V2 read-only trajectory: completed flights continue in analytical coast. */
export function flightViewAt(mission:Mission,radiusM:number,time:number):FlightSnapshot|null{
 const flight=mission.flight;if(!flight)return null;
 const impact=flight.checkpoints.find(c=>c.kind==='impact');
 if(impact&&time>=impact.timeS)return null;
 if(!flight.orbital&&mission.status==='success'&&time>flight.terminal.timeS)return null;
 const gravity=gravityForRadius(radiusM);
 const s=sampleAutonomousFlightWithPlanet(flight,gravity,Math.max(flight.plan.ignitionS,time));
 const impacted=flight.checkpoints.some(c=>c.kind==='impact'&&c.timeS<=time);
 const burn=flight.checkpoints.find((c,i)=>c.kind==='burn-start'&&time>=c.timeS&&time<(flight.checkpoints.slice(i+1).find(next=>next.kind==='burn-end'||next.kind==='impact')?.timeS??c.timeS));
 const phase:FlightSnapshot['phase']=impacted?'impact':burn?(burn.reason==='Physical liftoff'?'ascent':'circularization'):time>=flight.terminal.timeS&&!flight.orbital?'failure':'coast';
 return {state:s,orbit:analyzeTrajectory(s,gravity),phase,impacted};
}

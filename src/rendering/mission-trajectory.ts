import type {Vec2} from '../simulation/orbits';
import type {Mission} from '../simulation/civilization';

/** Only ascent telemetry points form a physical polyline. Do not connect
 * independent coast, maneuver, or outcome checkpoints with straight lines. */
const cache=new WeakMap<object,readonly {timeS:number;point:Vec2}[]>();
export function poweredTrack(mission:Mission,timeS=Infinity):readonly Vec2[]{
 const flight=mission.flight;if(!flight)return [];
 let samples=cache.get(flight);
 if(!samples){
  samples=[];
  for(const c of flight.checkpoints){
   if(c.kind==='coast'||c.reason==='Analytic coast to apoapsis')break;
   if(c.reason==='Physical liftoff'||c.reason==='Ascent telemetry checkpoint'||c.reason.startsWith('Ascent ')){
    samples=[...samples,{timeS:c.timeS,point:c.state.position}];
   }else break;
  }
  cache.set(flight,samples);
 }
 return samples.filter(c=>c.timeS<=timeS).map(c=>c.point);
}

/** A trail survives mission resolution only when a spacecraft remains in a stable orbit. */
export function shouldDrawMissionTrail(mission:Mission,timeS:number):boolean{
 const flight=mission.flight;
 if(!flight)return false;
 if(flight.checkpoints.some(c=>c.kind==='impact'&&c.timeS<=timeS))return false;
 if(mission.status==='ascending')return true;
 return mission.status==='success'&&flight.orbital;
}

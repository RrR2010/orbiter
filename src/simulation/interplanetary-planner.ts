import {orbitalPosition} from './orbits';
import type {Body,World} from './world';

/** First-pass circular Hohmann opportunity; never claims a physically achieved intercept. */
export type TransferOpportunity=Readonly<{
 originId:string;targetId:string;departureS:number;arrivalS:number;
 transferTimeS:number;heliocentricDeltaVMs:number;phaseErrorRad:number;
 approximate:boolean;
}>;
const SOLAR_MU=1.32712440018e20;
const TWO_PI=2*Math.PI;
const angle=(x:number,y:number):number=>Math.atan2(y,x);
const separation=(a:number,b:number):number=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const meanMotion=(body:Body):number=>TWO_PI/body.orbit!.period;

/** Plan a reproducible transfer opportunity from the actual ephemerides of two planets.
 * The estimate uses circular tangential burns; eccentric orbit effects remain in phase error.
 * Arrival is an intended time, NOT a guarantee of interception or successful launch.
 */
export function planTransferOpportunity(world:World,originId:string,targetId:string,nowS:number):TransferOpportunity|null{
 if(!Number.isFinite(nowS)||nowS<0)throw new Error('Invalid transfer epoch');
 const origin=world.bodies.find(body=>body.id===originId);
 const target=world.bodies.find(body=>body.id===targetId);
 if(!origin||!target||origin.kind!=='planet'||target.kind!=='planet'||origin.id===target.id||!origin.orbit||!target.orbit)return null;
 const r1=origin.orbit.semiMajorAxis,r2=target.orbit.semiMajorAxis;
 const transferTimeS=Math.PI*Math.sqrt(((r1+r2)/2)**3/SOLAR_MU);
 const v1=Math.sqrt(SOLAR_MU/r1),v2=Math.sqrt(SOLAR_MU/r2);
 const heliocentricDeltaVMs=Math.abs(v1*(Math.sqrt(2*r2/(r1+r2))-1))+Math.abs(v2*(1-Math.sqrt(2*r1/(r1+r2))));
 const rate=Math.abs(meanMotion(origin)-meanMotion(target));
 const synodicS=rate>0?TWO_PI/rate:Math.max(origin.orbit.period,target.orbit.period);
 let best:TransferOpportunity|null=null;
 // Bounded search across one synodic cycle followed by local refinement.
 const errorAt=(departureS:number):number=>{
  const from=orbitalPosition(origin.orbit!,departureS);
  const to=orbitalPosition(target.orbit!,departureS+transferTimeS);
  return Math.abs(separation(angle(to.x,to.y),angle(from.x,from.y)+Math.PI));
 };
 const samples=128;
 let index=0,lowest=Infinity;
 for(let i=0;i<=samples;i++){
  const error=errorAt(nowS+synodicS*i/samples);
  if(error<lowest){lowest=error;index=i;}
 }
 let left=nowS+synodicS*Math.max(0,index-1)/samples;
 let right=nowS+synodicS*Math.min(samples,index+1)/samples;
 // Deterministic ternary refinement of a locally unimodal alignment minimum.
 for(let i=0;i<48;i++){
  const third=(right-left)/3,a=left+third,b=right-third;
  if(errorAt(a)<=errorAt(b))right=b;else left=a;
 }
 const departureS=(left+right)/2;
 best={originId,targetId,departureS,arrivalS:departureS+transferTimeS,transferTimeS,heliocentricDeltaVMs,phaseErrorRad:errorAt(departureS),approximate:true};
 return best;
}

/** Rank targets using opportunity, imperfectly modeled transfer effort and waiting time. */
export function rankTransferOpportunities(world:World,originId:string,nowS:number):TransferOpportunity[]{
 return world.bodies.filter(body=>body.kind==='planet'&&body.id!==originId)
  .map(body=>planTransferOpportunity(world,originId,body.id,nowS))
  .filter((opportunity):opportunity is TransferOpportunity=>opportunity!==null)
  .sort((a,b)=>(a.phaseErrorRad*1e5+a.heliocentricDeltaVMs+(a.departureS-nowS)/86400*.2)-
   (b.phaseErrorRad*1e5+b.heliocentricDeltaVMs+(b.departureS-nowS)/86400*.2)||a.targetId.localeCompare(b.targetId));
}

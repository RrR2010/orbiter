import type {Vec2} from './orbits';

export type LambertTransfer=Readonly<{
 departureVelocity:Vec2;arrivalVelocity:Vec2;timeOfFlightS:number;
 transferAngleRad:number;residualS:number;
}>;
const cross=(a:Vec2,b:Vec2):number=>a.x*b.y-a.y*b.x;
const dot=(a:Vec2,b:Vec2):number=>a.x*b.x+a.y*b.y;
const norm=(v:Vec2):number=>Math.hypot(v.x,v.y);
const stumpff=(z:number):Readonly<{c:number;s:number}>=>{
 if(z>1e-7){const q=Math.sqrt(z);return {c:(1-Math.cos(q))/z,s:(q-Math.sin(q))/(q*q*q)};}
 if(z< -1e-7){const q=Math.sqrt(-z);return {c:(Math.cosh(q)-1)/(-z),s:(Math.sinh(q)-q)/(q*q*q)};}
 return {c:.5-z/24+z*z/720,s:1/6-z/120+z*z/5040};
};

/** Solve the prograde, zero-revolution planar Lambert boundary-value problem.
 * Universal-variable time-of-flight bisection avoids derivative singularities.
 * Opposite/collinear endpoints are intentionally unsupported: their transfer
 * plane is underdetermined by the two position vectors alone.
 */
export function solveLambert2D(
 from:Vec2,to:Vec2,timeOfFlightS:number,muM3S2:number,
):LambertTransfer|null{
 const r1=norm(from),r2=norm(to);
 if(![from.x,from.y,to.x,to.y,timeOfFlightS,muM3S2].every(Number.isFinite)||
  !(r1>0&&r2>0&&timeOfFlightS>0&&muM3S2>0))throw new Error('Invalid Lambert boundary');
 const cosine=Math.max(-1,Math.min(1,dot(from,to)/(r1*r2)));
 const sine=cross(from,to)/(r1*r2);
 // Prograde motion is counterclockwise; allow the long (>pi) transfer arc.
 const theta=(Math.atan2(sine,cosine)+2*Math.PI)%(2*Math.PI);
 if(Math.abs(sine)<1e-8||1-cosine<1e-12)return null;
 const A=Math.sin(theta)*Math.sqrt(r1*r2/(1-cosine));
 const tof=(z:number):number=>{
  const {c,s}=stumpff(z);
  if(!(c>0))return NaN;
  const y=r1+r2+A*(z*s-1)/Math.sqrt(c);
  if(y<0)return NaN;
  const x=Math.sqrt(y/c);
  return (x*x*x*s+A*Math.sqrt(y))/Math.sqrt(muM3S2);
 };
 // The single-revolution branch lies below z=4*pi^2. Bracket with a
 // deterministic scan; this also handles hyperbolic negative-z solutions.
 const minZ=-4*Math.PI*Math.PI,maxZ=4*Math.PI*Math.PI-1e-7;
 let lo=NaN,hi=NaN,previousZ=NaN,previousT=NaN;
 for(let i=0;i<=256;i++){
  const z=minZ+(maxZ-minZ)*i/256,t=tof(z);
  if(!Number.isFinite(t))continue;
  if(Number.isFinite(previousT)&&(previousT-timeOfFlightS)*(t-timeOfFlightS)<=0){
   lo=previousZ;hi=z;break;
  }
  previousZ=z;previousT=t;
 }
 if(!Number.isFinite(lo))return null;
 for(let i=0;i<64;i++){
  const mid=(lo+hi)/2;
  if(tof(mid)<timeOfFlightS)lo=mid;else hi=mid;
 }
 const z=(lo+hi)/2,{c,s}=stumpff(z);
 const y=r1+r2+A*(z*s-1)/Math.sqrt(c);
 const f=1-y/r1,g=A*Math.sqrt(y/muM3S2),gdot=1-y/r2;
 if(!(Math.abs(g)>1e-12))return null;
 return {
  departureVelocity:{x:(to.x-f*from.x)/g,y:(to.y-f*from.y)/g},
  arrivalVelocity:{x:(gdot*to.x-from.x)/g,y:(gdot*to.y-from.y)/g},
  timeOfFlightS,transferAngleRad:theta,residualS:Math.abs(tof(z)-timeOfFlightS),
 };
}

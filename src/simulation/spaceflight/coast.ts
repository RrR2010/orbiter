import type {Vec2} from '../orbits';
import type {FlightState,PlanetGravity} from './types';

const dot=(a:Vec2,b:Vec2):number=>a.x*b.x+a.y*b.y;
const stumpff=(z:number):{c:number;s:number}=>{
 if(z>1e-7){const q=Math.sqrt(z);return {c:(1-Math.cos(q))/z,s:(q-Math.sin(q))/(q*q*q)};}
 if(z< -1e-7){const q=Math.sqrt(-z);return {c:(Math.cosh(q)-1)/(-z),s:(Math.sinh(q)-q)/(q*q*q)};}
 return {c:.5-z/24+z*z/720,s:1/6-z/120+z*z/5040};
};

/** Universal-variable two-body propagation for elliptical and unbound ballistic flight. */
export function propagateCoast(state:FlightState,planet:PlanetGravity,dt:number):FlightState{
 if(!Number.isFinite(dt)||dt<0||!(planet.muM3S2>0))throw new Error('Invalid propagation request');
 if(dt===0)return state;
 const r0=state.position,v0=state.velocity,radius=Math.hypot(r0.x,r0.y),mu=planet.muM3S2;
 if(!(radius>0))throw new Error('Invalid orbital radius');
 const rootMu=Math.sqrt(mu),rv=dot(r0,v0),alpha=2/radius-dot(v0,v0)/mu;
 let x=Math.max(1e-12,rootMu*dt*(Math.abs(alpha)>1e-12?Math.abs(alpha):1/radius));
 if(alpha<0)x=Math.max(x,Math.sqrt(-1/alpha)*Math.log1p(dt*rootMu/radius)*1.5);
 for(let i=0;i<100;i++){
  const {c,s}=stumpff(alpha*x*x);
  const f=rv/rootMu*x*x*c+(1-alpha*radius)*x*x*x*s+radius*x-rootMu*dt;
  const fp=rv/rootMu*x*(1-alpha*x*x*s)+(1-alpha*radius)*x*x*c+radius;
  const step=f/fp;
  x-=step;
  if(!Number.isFinite(x))throw new Error('Coast solver diverged');
  if(Math.abs(step)<1e-9*Math.max(1,Math.abs(x)))break;
  if(i===99)throw new Error('Coast solver did not converge');
 }
 const {c,s}=stumpff(alpha*x*x),f=1-x*x/radius*c,g=dt-x*x*x/rootMu*s;
 const position={x:f*r0.x+g*v0.x,y:f*r0.y+g*v0.y},r=Math.hypot(position.x,position.y);
 const fdot=rootMu/(r*radius)*(alpha*x*x*x*s-x),gdot=1-x*x/r*c;
 return {...state,position,velocity:{x:fdot*r0.x+gdot*v0.x,y:fdot*r0.y+gdot*v0.y},timeS:state.timeS+dt};
}

export type CoastOutcome={state:FlightState;impacted:boolean};
/** Find the first surface crossing by bounded sampling then deterministic bisection. */
export function propagateUntilImpact(state:FlightState,planet:PlanetGravity,dt:number,samples=256):CoastOutcome{
 if(!Number.isFinite(dt)||dt<0||!Number.isSafeInteger(samples)||samples<2)throw new Error('Invalid search window');
 if(Math.hypot(state.position.x,state.position.y)<=planet.radiusM)return {state,impacted:true};
 let previous=0;
 for(let i=1;i<=samples;i++){
  const time=dt*i/samples,p=propagateCoast(state,planet,time);
  if(Math.hypot(p.position.x,p.position.y)<=planet.radiusM){
   let lo=previous,hi=time;
   for(let j=0;j<42;j++){const mid=(lo+hi)/2,q=propagateCoast(state,planet,mid);if(Math.hypot(q.position.x,q.position.y)<=planet.radiusM)hi=mid;else lo=mid;}
   return {state:propagateCoast(state,planet,hi),impacted:true};
  }
  previous=time;
 }
 return {state:propagateCoast(state,planet,dt),impacted:false};
}

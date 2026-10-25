import type {Vec2} from '../orbits';
import type {FlightState,PlanetGravity,Trajectory} from './types';
const dot=(a:Vec2,b:Vec2):number=>a.x*b.x+a.y*b.y;

/** Reconstruct the osculating conic without assuming that the vehicle is bound. */
export function analyzeTrajectory(state:Pick<FlightState,'position'|'velocity'>,planet:PlanetGravity):Trajectory{
 const {position:r,velocity:v}=state,mu=planet.muM3S2,dist=Math.hypot(r.x,r.y);
 if(!(dist>0&&mu>0&&planet.radiusM>0))throw new Error('Invalid orbital state');
 const h=r.x*v.y-r.y*v.x,energy=dot(v,v)/2-mu/dist;
 const ex=(v.y*h/mu)-r.x/dist,ey=(-v.x*h/mu)-r.y/dist;
 const e=Math.hypot(ex,ey),p=h*h/mu,peri=p/(1+e);
 const bound=energy<0&&e<1,apo=bound?p/(1-e):null,a=bound?-mu/(2*energy):null;
 const nearParabolic=Math.abs(energy)<mu/dist*1e-10;
 return {kind:nearParabolic?'parabolic':bound?'elliptic':'hyperbolic',energyJkg:energy,angularMomentumM2S:h,eccentricity:e,periapsisM:peri,apoapsisM:apo,semiMajorAxisM:a,periodS:a!==null?2*Math.PI*Math.sqrt(a**3/mu):null,surfaceIntersecting:peri<=planet.radiusM};
}

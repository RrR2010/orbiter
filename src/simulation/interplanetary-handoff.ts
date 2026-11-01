import {orbitalPosition,type Vec2} from './orbits';
import {gravityForRadius} from './spaceflight/gravity';
import type {FlightState} from './spaceflight/types';
import type {Body,World} from './world';

const SOLAR_MU=1.32712440018e20;
const add=(a:Vec2,b:Vec2):Vec2=>({x:a.x+b.x,y:a.y+b.y});

/** Approximate Laplace sphere-of-influence radius for a planet in SI units. */
export function planetSphereOfInfluence(body:Body):number{
 if(body.kind!=='planet'||!body.orbit)throw new Error('Expected orbiting planet');
 const mu=gravityForRadius(body.radius).muM3S2;
 return body.orbit.semiMajorAxis*(mu/SOLAR_MU)**(2/5);
}

/** Compute planet heliocentric velocity from deterministic Kepler ephemerides. */
export function planetaryVelocityAt(body:Body,timeS:number):Vec2{
 if(body.kind!=='planet'||!body.orbit||!Number.isFinite(timeS))throw new Error('Invalid planetary ephemeris');
 const orbit=body.orbit;
 const step=Math.min(1,orbit.period/1e6);
 const a=orbitalPosition(orbit,timeS-step),b=orbitalPosition(orbit,timeS+step);
 return {x:(b.x-a.x)/(2*step),y:(b.y-a.y)/(2*step)};
}

/** Transform a local inertial state at an SOI boundary into a solar inertial state.
 * The transform only changes reference frames; it performs no burn or propagation.
 */
export function handoffToHeliocentric(world:World,planetId:string,local:FlightState):FlightState{
 const planet=world.bodies.find(body=>body.id===planetId);
 if(!planet||planet.kind!=='planet'||!planet.orbit||!Number.isFinite(local.timeS))throw new Error('Invalid handoff planet');
 const soi=planetSphereOfInfluence(planet);
 const radius=Math.hypot(local.position.x,local.position.y);
 if(!Number.isFinite(radius)||radius<soi*(1-1e-8))throw new Error('State has not reached sphere of influence');
 if(![local.velocity.x,local.velocity.y,local.massKg,local.fuelKg].every(Number.isFinite)||local.massKg<=0||local.fuelKg<0||local.fuelKg>=local.massKg)throw new Error('Invalid local flight state');
 return {...local,position:add(orbitalPosition(planet.orbit,local.timeS),local.position),
  velocity:add(planetaryVelocityAt(planet,local.timeS),local.velocity)};
}

import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {planFlight,flightAt} from '../src/simulation/spaceflight/flight';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';

describe('launch guidance diversity',()=>{
 const world=generateWorld('orbiter-002'),planet=world.bodies.find(b=>b.kind==='planet')!;
 it('chooses vertical, gradual and tangential guidance deterministically',()=>{
  const plans=Array.from({length:80},(_,i)=>planFlight(world.seed,'guidance-'+i,planet,1000,4));
  const values=new Set(plans.map(p=>p.ascent.progradeFraction.toFixed(2)+':'+p.ascent.endProgradeFraction?.toFixed(2)));
  expect(values.size).toBeGreaterThanOrEqual(3);
  for(let i=0;i<plans.length;i++){
   expect(plans[i]).toEqual(planFlight(world.seed,'guidance-'+i,planet,1000,4));
   expect(plans[i].ascent.progradeFraction).toBeGreaterThanOrEqual(0);
   expect(plans[i].ascent.endProgradeFraction).toBeLessThanOrEqual(1);
  }
 });
 it('starts every guidance profile from the surface and finite state',()=>{
  const gravity=gravityForRadius(planet.radius);
  for(let i=0;i<12;i++){
   const plan=planFlight(world.seed,'flight-'+i,planet,1000,4);
   const initial=flightAt(plan,gravity,plan.ignitionS);
   expect(Math.hypot(initial.state.position.x,initial.state.position.y)).toBeCloseTo(planet.radius+10,4);
   expect(plan.orbitalReserveKg).toBeGreaterThan(0);
   const end=flightAt(plan,gravity,plan.insertionEndS);
   if(!end.impacted)expect(end.state.fuelKg).toBeGreaterThan(0);
   const mid=flightAt(plan,gravity,plan.ignitionS+25);
   expect(Number.isFinite(mid.state.position.x+mid.state.velocity.y)).toBe(true);
  }
 });
});

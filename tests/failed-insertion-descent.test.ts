import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {gravityForRadius} from '../src/simulation/spaceflight/gravity';
import {propagateUntilImpact} from '../src/simulation/spaceflight/coast';
import {createAutonomousFlightV2,type AutonomousFlightResultV2} from '../src/simulation/spaceflight/flight-v2';
import {flightViewAt} from '../src/rendering/flight-view';
import type {Mission} from '../src/simulation/civilization';

describe('failed orbital insertion is not an instant disappearance',()=>{
 it('shows ballistic descent after abort and hides the craft only at impact',()=>{
  const world=generateWorld('failed-insertion-descent');
  const home=world.bodies.find(b=>b.kind==='planet')!;
  const gravity=gravityForRadius(home.radius);
  const plan=createAutonomousFlightV2(world.seed,'test-flight',home,0,4);
  const state={...plan.initial,position:{x:home.radius+100000,y:0},velocity:{x:-200,y:0}};
  const fall=propagateUntilImpact(state,gravity,10000);
  expect(fall.impacted).toBe(true);
  expect(fall.state.timeS).toBeGreaterThan(0);
  const flight:AutonomousFlightResultV2={
   version:2,plan,checkpoints:[
    {timeS:0,state,kind:'burn-start',reason:'Physical liftoff'},
    {timeS:0,state,kind:'abort',reason:'No stable orbit'},
    {timeS:fall.state.timeS,state:fall.state,kind:'impact',reason:'Vehicle impacted after unsuccessful orbital insertion'}
   ],terminal:fall.state,outcome:'failed',reason:'No stable orbit',orbital:false,goalAchieved:false
  };
  const mission:Mission={id:'test-flight',originId:home.id,targetId:home.id,startedAt:0,launchAt:0,resolvedAt:fall.state.timeS,status:'ascending',success:null,vehicleId:'test-flight',flight};
  const midway=flightViewAt(mission,home.radius,fall.state.timeS/2);
  expect(midway).not.toBeNull();
  expect(midway!.impacted).toBe(false);
  expect(Math.hypot(midway!.state.position.x,midway!.state.position.y)).toBeGreaterThan(home.radius);
  expect(flightViewAt(mission,home.radius,fall.state.timeS)).toBeNull();
 });
});

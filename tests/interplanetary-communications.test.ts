import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {orbitalPosition} from '../src/simulation/orbits';
import {LIGHT_SPEED_MS,scheduleScienceTransmission} from '../src/simulation/interplanetary-communications';

describe('causal interplanetary science transmissions',()=>{
 const world=generateWorld('phase-five-transmission');
 const [home,target]=world.bodies.filter(body=>body.kind==='planet');
 const time=1e6,probePosition=orbitalPosition(target.orbit!,time);
 it('delays knowledge until light can reach the moving homeworld',()=>{
  const result=scheduleScienceTransmission(world,home.id,target.id,probePosition,time);
  expect(result.receivedAtS).toBeGreaterThan(time);
  expect(result.signalTravelS).toBeCloseTo(result.distanceM/LIGHT_SPEED_MS,6);
  const receiver=orbitalPosition(home.orbit!,result.receivedAtS);
  expect(Math.hypot(receiver.x-probePosition.x,receiver.y-probePosition.y)).toBeCloseTo(result.distanceM,4);
  expect(result).toEqual(scheduleScienceTransmission(world,home.id,target.id,probePosition,time));
 });
 it('accounts for a changing receiver position instead of using the emission snapshot',()=>{
  const result=scheduleScienceTransmission(world,home.id,target.id,probePosition,time);
  const homeAtEmission=orbitalPosition(home.orbit!,time);
  const originalDistance=Math.hypot(homeAtEmission.x-probePosition.x,homeAtEmission.y-probePosition.y);
  expect(Math.abs(result.distanceM-originalDistance)).toBeGreaterThan(0);
 });
 it('rejects invalid epochs and positions',()=>{
  expect(()=>scheduleScienceTransmission(world,home.id,target.id,probePosition,-1)).toThrow();
  expect(()=>scheduleScienceTransmission(world,home.id,target.id,{x:NaN,y:0},time)).toThrow();
  expect(()=>scheduleScienceTransmission(world,home.id,home.id,probePosition,time)).toThrow();
 });
});

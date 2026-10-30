import {describe,expect,it} from 'vitest';
import {generateWorld,positionsAt} from '../src/simulation/world';
import {createCivilization,type Mission} from '../src/simulation/civilization';
import {homeLaunchSite,sitePosition} from '../src/simulation/spaceflight/surface-site';
import {launchPadPosition,launchCameraZoom} from '../src/ui/mission-camera';

describe('Phase 4 launch camera',()=>{
 const world=generateWorld('phase4-pad-follow');
 const civil=createCivilization(world);
 const body=world.bodies.find(b=>b.id===civil.homeId)!;
 const mission:Mission={id:'mission-test',originId:body.id,targetId:body.id,startedAt:0,launchAt:1200,resolvedAt:0,status:'preparing',success:null,vehicleId:'vehicle-test'};
 it('follows physical launch site rather than planet centre at different times',()=>{
  const local=sitePosition(homeLaunchSite(world.seed,body.id),body.radius);
  for(const time of [0,300,1200,86400]){
   const origin=positionsAt(world,time).get(body.id)!;
   const pad=launchPadPosition(world,mission,time)!;
   expect(pad.x-origin.x).toBeCloseTo(local.x,4);
   expect(pad.y-origin.y).toBeCloseTo(local.y,4);
   expect(Math.hypot(pad.x-origin.x,pad.y-origin.y)).toBeCloseTo(body.radius+10,3);
  }
 });
 it('returns no invented target for missing origin',()=>{
  expect(launchPadPosition(world,{...mission,originId:'missing'},1200)).toBeNull();
 });
 it('keeps a finite bounded local framing zoom',()=>{
  const zoom=launchCameraZoom(body.radius,800);
  expect(Number.isFinite(zoom)).toBe(true);
  expect(zoom).toBeGreaterThan(1);
  expect(zoom).toBeLessThanOrEqual(2_000_000);
 });
});

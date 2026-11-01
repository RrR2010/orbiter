import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization,advanceCivilization,parseCivilization,serializeCivilization} from '../src/simulation/civilization';
import {SimulationClock} from '../src/core/clock';

/** M0 scheduler and clock equivalence across partitioning, event budgets and pause. */
describe('phase 7 M0 temporal equivalence',()=>{
 it('preserves strategic state across single, partitioned and budgeted advances',()=>{
  const world=generateWorld('phase7-m0-scheduler'),target=2e6;
  const single=createCivilization(world),split=createCivilization(world),budgeted=createCivilization(world);
  advanceCivilization(single,world,target);
  for(let t=100000;t<=target;t+=100000)advanceCivilization(split,world,t);
  for(let t=100000;t<=target;t+=100000){
   let attempts=0;
   do{
    advanceCivilization(budgeted,world,t,1);
    if(++attempts>10000)throw new Error('Scheduler budget exhausted');
   }while(budgeted.time<t);
  }
  expect(split).toEqual(single);
  expect(budgeted).toEqual(single);
  expect(parseCivilization(serializeCivilization(single),world,target)).toEqual(single);
 });
 it('preserves elapsed simulation time across warp partitioning and pause',()=>{
  const single=new SimulationClock(0,100),split=new SimulationClock(0,100);
  single.advance(10);
  for(let i=0;i<100;i++)split.advance(.1);
  expect(split.time).toBeCloseTo(single.time,8);
  single.setWarp(0);
  single.advance(10);
  expect(single.time).toBe(1000);
  expect(single.settleTo(1200)).toBe(1200);
  expect(single.warp).toBe(0);
 });
});

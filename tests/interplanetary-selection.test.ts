import {describe,expect,it} from 'vitest';
import {generateWorld} from '../src/simulation/world';
import {createCivilization} from '../src/simulation/civilization';
import {selectInterplanetaryOpportunity} from '../src/simulation/interplanetary-selection';

describe('technology-gated interplanetary opportunity selection',()=>{
 const world=generateWorld('phase-five-selection');
 it('does not authorize a flight before technology is ready',()=>{
  const civilization=createCivilization(world);
  expect(selectInterplanetaryOpportunity(civilization,world,1e6)).toBeNull();
 });
 it('is pure and deterministic when advanced vehicle capacity is available',()=>{
  const civilization=createCivilization(world);
  civilization.stage=4;
  civilization.knowledge=10000;
  const before=JSON.stringify(civilization);
  const a=selectInterplanetaryOpportunity(civilization,world,1e6);
  const b=selectInterplanetaryOpportunity(civilization,world,1e6);
  expect(a).toEqual(b);
  expect(JSON.stringify(civilization)).toBe(before);
  if(a){
   expect(a.opportunity.originId).toBe(civilization.homeId);
   expect(a.opportunity.targetId).not.toBe(civilization.homeId);
   expect(a.budget.feasible).toBe(true);
   expect(a.gravityUncertainty).toBeGreaterThan(0);
  }
 });
 it('does not pretend historical V2 records without scientific memory can be planned directly',()=>{
  const civilization=createCivilization(world);
  civilization.stage=4;
  delete civilization.science;
  expect(selectInterplanetaryOpportunity(civilization,world,1e6)).toBeNull();
 });
});

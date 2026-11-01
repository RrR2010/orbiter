import {describe,expect,it} from 'vitest';
import {interplanetaryScheduleLabels} from '../src/ui/interplanetary-schedule-labels';
import type {MissionTimeline} from '../src/simulation/interplanetary-mission-timeline';

describe('interplanetary schedule visibility',()=>{
 const timeline={
  missionId:'probe',cursor:0,timeS:0,
  manifest:{departureS:10*86400,arrivalS:130*86400}
 } as MissionTimeline;
 it('shows an actionable countdown and absolute simulated epochs',()=>{
  const labels=interplanetaryScheduleLabels(timeline,2*86400);
  expect(labels.countdown).toBe('T−8 d 0 h');
  expect(labels.departure).toContain('10 dias');
  expect(labels.arrival).toContain('130 dias');
  expect(labels.travel).toBe('120 d 0 h');
 });
 it('stops the countdown after launch without revealing mission outcome',()=>{
  expect(interplanetaryScheduleLabels(timeline,11*86400).countdown).toBe('Partida realizada');
 });
});

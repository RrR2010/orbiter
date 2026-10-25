import {describe,expect,it} from 'vitest';
import {metricText,missionTelemetry} from '../src/ui/mission-telemetry';
import type {Mission} from '../src/simulation/civilization';

const planned:Mission={id:'mission-1',originId:'planet-1',targetId:'planet-1',startedAt:0,launchAt:1200,resolvedAt:0,status:'preparing',success:null,vehicleId:'vehicle-1'};

describe('Phase 4 contextual telemetry contract',()=>{
 it('never fabricates data for a mission without physical flight',()=>{
  const result=missionTelemetry(planned,6_000_000,500);
  expect(result.phase).toBe('Preparação');
  expect(result.altitudeM).toBeNull();
  expect(result.speedMs).toBeNull();
  expect(result.fuelKg).toBeNull();
  expect(result.deltaVMs).toBeNull();
  expect(result.ispS).toBeNull();
  expect(result.apoapsisM).toBeNull();
 });
 it('formats unavailable and invalid numerical data as N/D',()=>{
  expect(metricText(null,'km')).toBe('N/D');
  expect(metricText(Number.NaN,'m/s')).toBe('N/D');
  expect(metricText(Infinity,'%')).toBe('N/D');
 });
 it('converts SI distance, speed, and fraction for display',()=>{
  expect(metricText(1500,'km')).toBe('1,5 km');
  expect(metricText(7200,'km/s')).toBe('7,2 km/s');
  expect(metricText(.42,'%')).toBe('42 %');
 });
});

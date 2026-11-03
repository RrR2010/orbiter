import {describe,expect,it} from 'vitest';
import {generateWorld,positionsAt} from '../src/simulation/world';
import {advanceCivilization,createCivilization,serializeCivilization} from '../src/simulation/civilization';
import {bodyFrame,solarFrame} from '../src/simulation/reference-frames';
import {bodyEntityId,createStateProvider,localVehicleEntityId,probeEntityId,stateTelemetry} from '../src/ui/state-provider';

describe('phase 8 M2 universal state provider',()=>{
 it('preserves celestial positions and reports nonexistent resources as unavailable',()=>{
  const world=generateWorld('m2-celestial'),provider=createStateProvider(world),epoch=123456;
  const body=world.bodies.find(b=>b.kind==='planet')!;
  const id=bodyEntityId(body.id),solar=provider.at(id,epoch,solarFrame)!;
  expect(solar.positionM).toEqual(positionsAt(world,epoch).get(body.id));
  expect(provider.at(id,epoch,bodyFrame(body.id))?.positionM.x).toBeCloseTo(0,4);
  expect(stateTelemetry(provider,id,epoch)?.massKg).toBeNull();
  expect(stateTelemetry(provider,id,epoch)?.fuelKg).toBeNull();
  expect(provider.at('body/missing',epoch,solarFrame)).toBeNull();
  expect(()=>provider.at(id,-1,solarFrame)).toThrow();
 });
 it('samples a real local vehicle through both frames without mutating the save',()=>{
  const world=generateWorld('flight-projection'),c=createCivilization(world);
  advanceCivilization(c,world,300000,10000);
  const mission=c.missions.find(m=>m.flight)!;
  expect(mission).toBeDefined();
  const id=localVehicleEntityId(mission.id),provider=createStateProvider(world,c);
  const epoch=mission.flight!.plan.ignitionS+22.5;
  const before=serializeCivilization(c);
  const local=provider.at(id,epoch,bodyFrame(mission.originId))!;
  const solar=provider.at(id,epoch,solarFrame)!;
  expect(local.massKg).toBeGreaterThan(0);
  expect(local.fuelKg).toBeGreaterThanOrEqual(0);
  expect(solar.epochS).toBe(epoch);
  expect(provider.at(id,epoch,solarFrame)).toEqual(solar);
  expect(provider.at(id,mission.flight!.plan.ignitionS-1,solarFrame)).toBeNull();
  expect(serializeCivilization(c)).toBe(before);
 });
 it('resolves a physically launched interplanetary probe without leaking a scheduled state',()=>{
  const world=generateWorld('phase-five-real-vehicle'),c=createCivilization(world);
  c.stage=4;c.knowledge=3000;c.resources=300;c.nextAt=1;
  c.missions.push({id:'completed-local-flight',originId:c.homeId,targetId:c.homeId,
   startedAt:0,launchAt:0,resolvedAt:0,status:'success',success:true,vehicleId:'historical-local'});
  advanceCivilization(c,world,1);
  const timeline=c.interplanetaryTimelines![0],id=probeEntityId(timeline.missionId);
  const provider=createStateProvider(world,c);
  expect(provider.resolve(id)?.kind).toBe('interplanetary-probe');
  expect(provider.at(id,1,solarFrame)).toBeNull();
  const epoch=timeline.manifest.correctedCoastStart.timeS;
  advanceCivilization(c,world,epoch,10000);
  const before=serializeCivilization(c),solar=provider.at(id,epoch,solarFrame)!;
  expect(solar.positionM).toEqual(timeline.manifest.correctedCoastStart.position);
  expect(solar.fuelKg).toBeGreaterThanOrEqual(0);
  expect(provider.at(id,epoch,bodyFrame(timeline.manifest.originId))?.epochS).toBe(epoch);
  expect(serializeCivilization(c)).toBe(before);
 });
});

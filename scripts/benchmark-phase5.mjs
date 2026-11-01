import {build} from 'esbuild';
import {performance} from 'node:perf_hooks';
import {Buffer} from 'node:buffer';

const entry = [
  "export {generateWorld} from './src/simulation/world.ts';",
  "export {createCivilization,advanceCivilization,serializeCivilization,parseCivilization} from './src/simulation/civilization.ts';",
  "export {interplanetaryProbeSymbols} from './src/rendering/interplanetary-probe-symbols.ts';",
].join('\n');
const result = await build({stdin:{contents:entry,resolveDir:process.cwd(),sourcefile:'phase5-benchmark.ts',loader:'ts'},bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
const {generateWorld,createCivilization,advanceCivilization,serializeCivilization,parseCivilization,interplanetaryProbeSymbols} =
  await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));

const days = 1400, targetS = days*86400, stepS = 1_000_000;
for(const seed of ['phase-five-real-vehicle','orbiter-002','phase-five-injection']){
  const world = generateWorld(seed), c = createCivilization(world);
  const started = performance.now();
  let events = 0, projections = 0, maxMissions = 0, maxEvents = 0;
  for(let time = stepS; ; time = Math.min(time+stepS,targetS)){
    let attempts = 0;
    do {
      events += advanceCivilization(c,world,time,256);
      if(++attempts > 10000)throw new Error('Scheduler event budget exhausted');
    } while(c.time < time);
    projections += interplanetaryProbeSymbols(c,c.time,world).length;
    maxMissions = Math.max(maxMissions,c.missions.length);
    maxEvents = Math.max(maxEvents,c.events.length);
    if(time === targetS)break;
  }
  const saved = serializeCivilization(c);
  const restored = parseCivilization(saved,world,c.time);
  if(serializeCivilization(restored)!==saved)throw new Error('Save roundtrip mismatch');
  console.log(JSON.stringify({seed,simulatedDays:days,elapsedMs:Number((performance.now()-started).toFixed(2)),
    events,probeTimelines:c.interplanetaryTimelines?.length??0,projections,maxMissions,maxEvents,
    saveBytes:Buffer.byteLength(saved),heapUsedMB:Number((process.memoryUsage().heapUsed/1048576).toFixed(1))}));
}
console.log('Phase 5 strategic scheduler benchmark; excludes browser Canvas and FPS.');

import {build} from 'esbuild';
import {performance} from 'node:perf_hooks';
import {Buffer} from 'node:buffer';

const entry=[
 "export {generateWorld} from './src/simulation/world.ts';",
 "export {createCivilization,advanceCivilization,serializeCivilization,parseCivilization} from './src/simulation/civilization.ts';",
 "export {missionOperationRecords} from './src/simulation/mission-operation-projection.ts';",
].join('\n');
const bundled=await build({stdin:{contents:entry,resolveDir:process.cwd(),sourcefile:'m3-benchmark.ts',loader:'ts'},
 bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
const {generateWorld,createCivilization,advanceCivilization,serializeCivilization,parseCivilization,missionOperationRecords}=
 await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));

const targetS=1400*86400,stepS=1_000_000;
for(const seed of ['phase-five-real-vehicle','orbiter-002','phase-five-injection']){
 const world=generateWorld(seed),c=createCivilization(world);
 let schedulerEvents=0;
 for(let time=stepS;;time=Math.min(time+stepS,targetS)){
  let attempts=0;
  do{
   schedulerEvents+=advanceCivilization(c,world,time,256);
   if(++attempts>10000)throw new Error('Scheduler budget exhausted');
  }while(c.time<time);
  if(time===targetS)break;
 }
 const saved=serializeCivilization(c),start=performance.now();
 const records=missionOperationRecords(c);
 const projectionMs=performance.now()-start;
 if(serializeCivilization(c)!==saved)throw new Error('M3 mutated civilization');
 const restored=parseCivilization(saved,world,c.time);
 if(JSON.stringify(missionOperationRecords(restored))!==JSON.stringify(records))
  throw new Error('M3 projection changed after reload');
 const second=missionOperationRecords(c);
 if(JSON.stringify(second)!==JSON.stringify(records))throw new Error('M3 projection is not idempotent');
 console.log(JSON.stringify({seed,simulatedDays:1400,schedulerEvents,missions:c.missions.length,
  probes:c.interplanetaryTimelines?.length??0,records:records.length,
  operations:records.reduce((n,r)=>n+r.operations.length,0),
  checkpoints:records.reduce((n,r)=>n+r.checkpoints.length,0),
  confirmedEvents:records.reduce((n,r)=>n+r.events.length,0),
  projectionMs:Number(projectionMs.toFixed(2)),saveBytes:Buffer.byteLength(saved),
  heapUsedMB:Number((process.memoryUsage().heapUsed/1048576).toFixed(1))}));
}
console.log('M3 projection benchmark is read-only; no new scheduler/physics/Canvas work is performed.');

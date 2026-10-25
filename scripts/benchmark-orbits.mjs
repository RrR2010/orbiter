import {build} from 'esbuild';
import {performance} from 'node:perf_hooks';
import {Buffer} from 'node:buffer';

// Intentionally isolated from the browser and persistence. Bundled from the real
// production source, then run as a disposable in-memory Node module.
const source=[
 "export {gravityForRadius} from './src/simulation/spaceflight/gravity.ts';",
 "export {propagateCoast} from './src/simulation/spaceflight/coast.ts';",
 "export {predictLocalOrbit} from './src/rendering/predicted-orbit.ts';",
].join('\n');
const artifact=await build({stdin:{contents:source,resolveDir:process.cwd(),sourcefile:'benchmark-entry.ts',loader:'ts'},bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
const code=artifact.outputFiles[0].text;
const {gravityForRadius,propagateCoast,predictLocalOrbit}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const planet=gravityForRadius(6371000);
const sizes=process.argv.slice(2).filter(a=>/^\d+$/.test(a)).map(Number);
const counts=sizes.length?sizes:[100,1000,10000];
const longWarp=1_000_000;
const bench=(fn)=>{const start=performance.now();const result=fn();return {elapsedMs:Number((performance.now()-start).toFixed(2)),result};};
for(const count of counts){
 if(!Number.isSafeInteger(count)||count<1||count>100000)throw new Error('Use object counts 1..100000');
 const objects=Array.from({length:count},(_,i)=>{
  const height=150000+(i%200)*1300,r=planet.radiusM+height,phase=i*2.399963229728653;
  const speed=Math.sqrt(planet.muM3S2/r);
  return {position:{x:r*Math.cos(phase),y:r*Math.sin(phase)},velocity:{x:-speed*Math.sin(phase),y:speed*Math.cos(phase)},massKg:300,fuelKg:0,timeS:0};
 });
 const propagated=bench(()=>objects.map(s=>propagateCoast(s,planet,longWarp)));
 const visualCount=Math.min(8,count);
 const previews=bench(()=>propagated.result.slice(0,visualCount).map(s=>predictLocalOrbit(s,planet)));
 const checksum=propagated.result.reduce((sum,s)=>sum+s.position.x*1e-9+s.position.y*1e-9,0);
 const mem=process.memoryUsage().heapUsed/1024/1024;
 console.log(JSON.stringify({objects:count,simulatedStepS:longWarp,propagationMs:propagated.elapsedMs,previewObjects:visualCount,previewMs:previews.elapsedMs,heapUsedMB:Number(mem.toFixed(1)),checksum:Number(checksum.toFixed(6))}));
}
console.log('Synthetic two-body orbit and selected-LOD geometry benchmark only; no persisted world, DOM, scheduler or actual Canvas frame is changed.');

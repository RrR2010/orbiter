import type {Vec2} from '../simulation/orbits';

/** Original Canvas vector vehicle family; size in screen px, orientation from physical velocity. */
export function drawVehicleGlyph(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,kind:'rocket'|'satellite',velocity:Vec2|null,selected=false):void{
 if(!Number.isFinite(x)||!Number.isFinite(y)||size<=0)return;
 ctx.save();ctx.translate(x,y);
 if(selected){ctx.beginPath();ctx.arc(0,0,size*.8,0,2*Math.PI);ctx.strokeStyle='#9ae9ff';ctx.lineWidth=1.4;ctx.stroke();}
 if(size<12){
  ctx.fillStyle=kind==='rocket'?'#f2ca8e':'#8ddbe9';ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(3,3);ctx.lineTo(-3,3);ctx.closePath();ctx.fill();
  ctx.restore();return;
 }
 if(velocity&&Math.hypot(velocity.x,velocity.y)>1e-5)ctx.rotate(Math.atan2(velocity.y,velocity.x)+Math.PI/2);
 const half=size*.5;
 ctx.lineJoin='round';ctx.lineWidth=Math.max(1,size*.065);
 if(kind==='rocket'){
  ctx.fillStyle='#dbeaf7';ctx.strokeStyle='#7abbd1';ctx.beginPath();
  ctx.moveTo(0,-half);ctx.bezierCurveTo(half*.72,-half*.48,half*.45,half*.42,half*.28,half*.55);
  ctx.lineTo(-half*.28,half*.55);ctx.bezierCurveTo(-half*.45,half*.42,-half*.72,-half*.48,0,-half);
  ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#4b93b7';ctx.beginPath();ctx.arc(0,-half*.16,half*.14,0,2*Math.PI);ctx.fill();
  ctx.fillStyle='#edab68';ctx.beginPath();ctx.moveTo(-half*.19,half*.44);ctx.lineTo(0,half*.85);ctx.lineTo(half*.19,half*.44);ctx.fill();
 }else{
  ctx.fillStyle='#77cadd';ctx.strokeStyle='#a2e5f1';
  ctx.fillRect(-half,-half*.26,half*.62,half*.52);ctx.strokeRect(-half,-half*.26,half*.62,half*.52);
  ctx.fillRect(half*.38,-half*.26,half*.62,half*.52);ctx.strokeRect(half*.38,-half*.26,half*.62,half*.52);
  ctx.fillStyle='#e2eef9';ctx.fillRect(-half*.27,-half*.4,half*.54,half*.8);
  ctx.strokeStyle='#c6e7f5';ctx.beginPath();ctx.moveTo(0,-half*.4);ctx.lineTo(0,-half*.7);ctx.stroke();
 }
 ctx.restore();
}

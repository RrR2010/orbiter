/** Runtime atlas crop contract; the SVG sheet can later be replaced by a PNG without changing this API. */
export type SpriteId='planet'|'rocket'|'satellite'|'launchBase';
type Crop=Readonly<{x:number;y:number;w:number;h:number;px:number;py:number}>;
const crops:Record<SpriteId,Crop>={
 planet:{x:0,y:0,w:128,h:128,px:.5,py:.5},
 rocket:{x:128,y:0,w:128,h:128,px:.5,py:.5},
 satellite:{x:0,y:128,w:128,h:128,px:.5,py:.5},
 launchBase:{x:128,y:128,w:128,h:128,px:.5,py:.78}
};
let image:HTMLImageElement|null=null;
export function getStarterAtlas():HTMLImageElement|null{
 if(!image){
  image=new Image();image.src='/assets/orbiter-starter-atlas.svg';
 }
 return image.complete&&image.naturalWidth>0?image:null;
}
export function drawSprite(ctx:CanvasRenderingContext2D,id:SpriteId,x:number,y:number,size:number,rotation=0):boolean{
 const atlas=getStarterAtlas();if(!atlas||!Number.isFinite(size)||size<=0)return false;
 const crop=crops[id];ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
 ctx.drawImage(atlas,crop.x,crop.y,crop.w,crop.h,-crop.px*size,-crop.py*size,size,size);
 ctx.restore();return true;
}

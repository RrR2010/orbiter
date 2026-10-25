/** Clock commands are the single entry point for human and future automatic warp policies. */
export const WARP_LEVELS=[1,100,10000,100000,1000000] as const;
export type ActiveWarp=typeof WARP_LEVELS[number];
export type Warp=0|ActiveWarp;
export type ClockCommand={type:'set-warp';warp:Warp}|{type:'toggle-pause'};
export class SimulationClock{
 private resumeWarp:ActiveWarp;
 constructor(private seconds=0,private speed:Warp=100){if(!Number.isFinite(seconds)||seconds<0)throw new Error('Invalid time');this.resumeWarp=speed===0?100:speed;}
 get time():number{return this.seconds;}
 get warp():Warp{return this.speed;}
 get selectedWarp():ActiveWarp{return this.resumeWarp;}
 /** Apply commands from UI or future event-based controllers; no direct state mutation. */
 dispatch(command:ClockCommand):Warp{if(command.type==='toggle-pause'){this.speed=this.speed===0?this.resumeWarp:0;}else{if(![0,...WARP_LEVELS].includes(command.warp))throw new Error('Invalid warp');this.speed=command.warp;}if(this.speed!==0)this.resumeWarp=this.speed;return this.speed;}
 /** Settle already-earned simulation time while paused or catching up after a frame budget. */
 settleTo(time:number):number{if(!Number.isFinite(time)||time<this.seconds)throw new Error('Invalid settlement time');this.seconds=time;return this.seconds;}
 setWarp(value:Warp):void{this.dispatch({type:'set-warp',warp:value});}
 advance(elapsed:number):number{if(!Number.isFinite(elapsed)||elapsed<0)throw new Error('Invalid elapsed time');this.seconds+=elapsed*this.speed;return this.seconds;}
}
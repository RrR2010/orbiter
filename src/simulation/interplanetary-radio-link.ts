/** Simplified, deterministic deep-space radio range envelope.
 * Ranges are gameplay abstractions, not a calibrated RF link budget.
 * Only the emitting civilization's technology is considered.
 */
export function probeCommunicationRangeM(stage:number):number{
 if(!Number.isSafeInteger(stage)||stage<0||stage>4)throw new Error('Invalid radio technology stage');
 return [0,0,1e9,1e11,1e15][stage];
}

/** Loss of link prevents transmission; it never changes flight physics. */
export function canTransmitProbeScience(distanceM:number,stage:number):boolean{
 if(!Number.isFinite(distanceM)||distanceM<0)throw new Error('Invalid signal distance');
 return distanceM<=probeCommunicationRangeM(stage);
}

import {describe,expect,it} from 'vitest';
import {canTransmitProbeScience,probeCommunicationRangeM} from '../src/simulation/interplanetary-radio-link';

describe('deep-space probe radio link',()=>{
 it('gates scientific communication by technology and distance',()=>{
  expect(canTransmitProbeScience(1e12,2)).toBe(false);
  expect(canTransmitProbeScience(1e12,3)).toBe(false);
  expect(canTransmitProbeScience(1e12,4)).toBe(true);
  expect(canTransmitProbeScience(probeCommunicationRangeM(4),4)).toBe(true);
  expect(canTransmitProbeScience(probeCommunicationRangeM(4)+1,4)).toBe(false);
 });
 it('rejects invalid ranges and stages without random outcomes',()=>{
  expect(()=>canTransmitProbeScience(-1,4)).toThrow();
  expect(()=>canTransmitProbeScience(Infinity,4)).toThrow();
  expect(()=>probeCommunicationRangeM(5)).toThrow();
  expect(probeCommunicationRangeM(4)).toBe(probeCommunicationRangeM(4));
 });
});

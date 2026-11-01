import type {Civilization} from './civilization';
import {selectInterplanetaryOpportunity,type TransferCandidate} from './interplanetary-selection';
import type {World} from './world';

export const INTERPLANETARY_PREPARATION_S=1200;
export const INTERPLANETARY_MIN_LEAD_S=3600;
export const INTERPLANETARY_MAX_WAIT_S=10*365.25*86400;

export type InterplanetaryLaunchIntent=Readonly<{
 candidate:TransferCandidate;preparedAtS:number;launchAtS:number;arrivalAtS:number;
}>;

/** Find a future launch intent without altering the clock, missions or resources.
 * A selected window must leave enough time for preparation and observation.
 * The live mission scheduler will only consume this once a physical escape
 * and encounter outcome contract has been validated.
 */
export function proposeInterplanetaryLaunch(c:Readonly<Civilization>,world:World,timeS:number):InterplanetaryLaunchIntent|null{
 if(!Number.isFinite(timeS)||timeS<0)throw new Error('Invalid proposal time');
 if(c.stage<4||c.resources<70||c.missions.some(m=>m.status==='preparing'||m.status==='ascending'))return null;
 const earliest=timeS+INTERPLANETARY_PREPARATION_S+INTERPLANETARY_MIN_LEAD_S;
 const candidate=selectInterplanetaryOpportunity(c,world,earliest);
 if(!candidate)return null;
 const launchAtS=candidate.opportunity.departureS;
 if(launchAtS<earliest||launchAtS-timeS>INTERPLANETARY_MAX_WAIT_S)return null;
 return {candidate,preparedAtS:launchAtS-INTERPLANETARY_PREPARATION_S,launchAtS,arrivalAtS:candidate.opportunity.arrivalS};
}

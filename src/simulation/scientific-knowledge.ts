import {seededRandom} from '../core/random';
import type {World} from './world';

/** A body's real gravity is independent of the observer's estimates. */
export type ScientificEstimate=Readonly<{value:number;uncertainty:number;observations:number}>;
export type PlanetKnowledge=Readonly<{bodyId:string;gravity:ScientificEstimate}>;
export type ScientificKnowledge=Readonly<Record<string,PlanetKnowledge>>;
export type GravityObservation=Readonly<{bodyId:string;measuredGravity:number;relativeError:number;transmitted:boolean;observationId:string}>;
export type ScientificRecord=Readonly<{knowledge:ScientificKnowledge;receivedIds:readonly string[]}>;

const clamp=(value:number,min:number,max:number):number=>Math.max(min,Math.min(max,value));

/** Construct reproducible initial estimates; this does not read the true gravity. */
export function initialScientificRecord(world:World):ScientificRecord{
 const knowledge:Record<string,PlanetKnowledge>={};
 for(const body of world.bodies){
  if(body.kind!=='planet')continue;
  const random=seededRandom('orbiter:science:initial:v1:'+world.seed+':'+body.id);
  // Gravity is represented as a relative scale until the simulator supplies an authoritative SI value.
  knowledge[body.id]={bodyId:body.id,gravity:{value:.7+random()*.6,uncertainty:.45,observations:0}};
 }
 return {knowledge,receivedIds:[]};
}

/** Apply only received observations, once per ID; new data narrow uncertainty. */
export function receiveGravityObservation(state:ScientificRecord,observation:GravityObservation):ScientificRecord{
 const {bodyId,measuredGravity,relativeError,transmitted,observationId}=observation;
 if(!transmitted)return state;
 if(!observationId||!Number.isFinite(measuredGravity)||measuredGravity<=0||!Number.isFinite(relativeError)||relativeError<=0||relativeError>1)throw new Error('Invalid gravity observation');
 if(state.receivedIds.includes(observationId))return state;
 const prior=state.knowledge[bodyId];
 if(!prior)throw new Error('Unknown science destination');
 const weight=1/(relativeError*relativeError);
 const initialWeight=prior.gravity.observations===0?0:1/(prior.gravity.uncertainty**2);
 const value=(prior.gravity.value*initialWeight+measuredGravity*weight)/(initialWeight+weight);
 const uncertainty=clamp(Math.sqrt(1/(initialWeight+weight)),.001,1);
 return {knowledge:{...state.knowledge,[bodyId]:{bodyId,gravity:{value,uncertainty,observations:prior.gravity.observations+1}}},receivedIds:[...state.receivedIds,observationId]};
}

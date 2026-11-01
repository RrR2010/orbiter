import {seededRandom} from '../core/random';
import {gravityForRadius} from './spaceflight/gravity';
import type {World} from './world';

/** Gravity estimates and their one-sigma uncertainty are in m/s². */
export type ScientificEstimate=Readonly<{value:number;uncertainty:number;observations:number}>;
export type PlanetKnowledge=Readonly<{bodyId:string;gravity:ScientificEstimate}>;
export type ScientificKnowledge=Readonly<Record<string,PlanetKnowledge>>;
export type GravityObservation=Readonly<{bodyId:string;measuredGravity:number;relativeError:number;transmitted:boolean;observationId:string}>;
export type ScientificRecord=Readonly<{knowledge:ScientificKnowledge;receivedIds:readonly string[]}>;

const clamp=(value:number,min:number,max:number):number=>Math.max(min,Math.min(max,value));

/** Seeded imperfect astronomical inference; the physics remains authoritative and unchanged. */
export function initialScientificRecord(world:World):ScientificRecord{
 const knowledge:Record<string,PlanetKnowledge>={};
 for(const body of world.bodies){
  if(body.kind!=='planet')continue;
  const random=seededRandom('orbiter:science:initial:v2:'+world.seed+':'+body.id);
  const gravity=gravityForRadius(body.radius).muM3S2/(body.radius*body.radius);
  const value=gravity*(.7+random()*.6);
  knowledge[body.id]={bodyId:body.id,gravity:{value,uncertainty:value*.45,observations:0}};
 }
 return {knowledge,receivedIds:[]};
}

/** Assimilate a received measurement once, weighting prior and measurement by variance. */
export function receiveGravityObservation(state:ScientificRecord,observation:GravityObservation):ScientificRecord{
 const {bodyId,measuredGravity,relativeError,transmitted,observationId}=observation;
 if(!transmitted)return state;
 if(!observationId||!Number.isFinite(measuredGravity)||measuredGravity<=0||!Number.isFinite(relativeError)||relativeError<=0||relativeError>1)throw new Error('Invalid gravity observation');
 if(state.receivedIds.includes(observationId))return state;
 const prior=state.knowledge[bodyId];
 if(!prior)throw new Error('Unknown science destination');
 const measuredSigma=measuredGravity*relativeError;
 const priorWeight=1/(prior.gravity.uncertainty**2);
 const measurementWeight=1/(measuredSigma**2);
 const value=(prior.gravity.value*priorWeight+measuredGravity*measurementWeight)/(priorWeight+measurementWeight);
 const uncertainty=Math.sqrt(1/(priorWeight+measurementWeight));
 if(!Number.isFinite(value)||!Number.isFinite(uncertainty)||uncertainty<=0)throw new Error('Invalid measurement precision');
 return {knowledge:{...state.knowledge,[bodyId]:{bodyId,gravity:{value,uncertainty:clamp(uncertainty,Number.MIN_VALUE,Infinity),observations:prior.gravity.observations+1}}},receivedIds:[...state.receivedIds,observationId]};
}

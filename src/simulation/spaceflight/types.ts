import type {Vec2} from '../orbits';

/** All positions, velocities, masses and times use SI units in a planet-centered inertial plane. */
export type FlightState=Readonly<{position:Vec2;velocity:Vec2;massKg:number;fuelKg:number;timeS:number}>;
export type PlanetGravity=Readonly<{radiusM:number;muM3S2:number}>;
export type Burn=Readonly<{startS:number;endS:number;thrustN:number;ispS:number;progradeFraction:number}>;
export type Trajectory=Readonly<{kind:'elliptic'|'parabolic'|'hyperbolic';energyJkg:number;angularMomentumM2S:number;eccentricity:number;periapsisM:number;apoapsisM:number|null;semiMajorAxisM:number|null;periodS:number|null;surfaceIntersecting:boolean}>;

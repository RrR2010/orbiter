import {describe,it,expect} from 'vitest';
import {generateWorld,positionsAt} from '../src/simulation/world';
import {cameraScale,projectPoint,unprojectPoint} from '../src/rendering/camera';
import {pickBody} from '../src/rendering/pick';
import {DEFAULT_OBSERVATORY,parseObservatory,selectBody,focusBody,updateFollow,resetView,bodyTelemetry,distanceLabel,orbitalSpeed} from '../src/ui/observatory';

describe('observatory commands',()=>{
  const world=generateWorld('phase2-regression');
  const planet=world.bodies.find(b=>b.kind==='planet')!;
  const moon=world.bodies.find(b=>b.kind==='moon')!;
  it('selects valid bodies and deselects unknown identities',()=>{
    const state=structuredClone(DEFAULT_OBSERVATORY);
    selectBody(state,world,moon.id);expect(state.selectedId).toBe(moon.id);
    state.follow=true;selectBody(state,world,'missing');expect(state.selectedId).toBeNull();expect(state.follow).toBe(false);
  });
  it('focuses on moons and follows the current Keplerian position at high warp',()=>{
    const state=structuredClone(DEFAULT_OBSERVATORY),camera={x:0,y:0,zoom:1};
    expect(focusBody(camera,state,world,0,moon.id)).toBe(true);
    expect(camera.zoom).toBe(1);expect(state.follow).toBe(true);
    const target=positionsAt(world,1e7).get(moon.id)!;
    const before=Math.hypot(camera.x-target.x,camera.y-target.y);
    updateFollow(camera,state,world,1e7,.1);
    expect(Math.hypot(camera.x-target.x,camera.y-target.y)).toBeLessThan(before);
    expect(camera.zoom).toBeGreaterThan(1);
    for(let i=0;i<100;i++)updateFollow(camera,state,world,1e7,.1);
    expect(camera.x).toBeCloseTo(target.x,0);expect(camera.y).toBeCloseTo(target.y,0);
    resetView(camera,state);expect(camera).toEqual({x:0,y:0,zoom:1});expect(state.follow).toBe(false);
  });
  it('roundtrips camera projection and picks visible planets',()=>{
    const camera={x:0,y:0,zoom:1},point=positionsAt(world,0).get(planet.id)!;
    expect(cameraScale(1200,800,camera)).toBeGreaterThan(0);
    const screen=projectPoint(point,camera,1200,800),back=unprojectPoint(screen,camera,1200,800);
    expect(Math.hypot(back.x-point.x,back.y-point.y)).toBeLessThan(0.01);
    expect(pickBody(world,0,camera,1200,800,screen.x,screen.y)).toBe(planet.id);
  });
  it('derives finite physically consistent orbital telemetry',()=>{
    const t=bodyTelemetry(moon,world,123456);
    expect(t.radius).toBe(moon.radius);expect(t.semiMajorAxis).toBe(moon.orbit!.semiMajorAxis);
    expect(t.distance).toBeGreaterThan(0);expect(t.speed).toBeGreaterThan(0);
    const star=bodyTelemetry(world.bodies[0],world,0);
    expect(star.speed).toBeNull();expect(star.distance).toBeNull();
    expect(orbitalSpeed(planet,0)).toBeGreaterThan(0);
    expect(distanceLabel(null)).toBe('—');
  });
  it('preserves independent layer settings and rejects malformed settings',()=>{
    const current=structuredClone(DEFAULT_OBSERVATORY);current.layers.belt=false;
    const parsed=parseObservatory(JSON.stringify(current));
    expect(parsed.layers.belt).toBe(false);expect(parsed.layers.orbits).toBe(true);
    expect(parseObservatory('{')).toEqual(DEFAULT_OBSERVATORY);
    const legacy=JSON.parse(JSON.stringify(current)) as Record<string,unknown>;delete legacy.cameraSpeed;
    expect(parseObservatory(JSON.stringify(legacy)).cameraSpeed).toBe(3);
    expect(parseObservatory(JSON.stringify({...current,cameraSpeed:7})).cameraSpeed).toBe(7);
  });
});
import {describe,expect,it} from 'vitest';
import {generateWorld,positionsAt,AU} from '../src/simulation/world';
import {pickBody} from '../src/rendering/pick';
import {projectPoint,cameraScale} from '../src/rendering/camera';

describe('planet selection across zoom levels',()=>{
 const world=generateWorld('orbiter-001'),body=world.bodies.find(b=>b.kind==='planet')!;
 const time=200000,width=1600,height=900,center=positionsAt(world,time).get(body.id)!;
 it('selects the center at close zoom',()=>{
  const camera={x:center.x,y:center.y,zoom:20000};
  expect(pickBody(world,time,camera,width,height,width/2,height/2)).toBe(body.id);
 });
 it('selects near the surface of an enlarged planet',()=>{
  const camera={x:center.x,y:center.y,zoom:20000};
  const radius=body.radius*cameraScale(width,height,camera);
  const point=projectPoint({x:center.x+radius/cameraScale(width,height,camera)*.85,y:center.y},camera,width,height);
  expect(pickBody(world,time,camera,width,height,point.x,point.y)).toBe(body.id);
 });
 it('does not treat the entire viewport as a planet at far zoom',()=>{
  const camera={x:0,y:0,zoom:1};
  expect(cameraScale(width,height,camera)).toBeGreaterThan(0);
  expect(AU).toBeGreaterThan(0);
  expect(pickBody(world,time,camera,width,height,-9999,-9999)).toBe(null);
 });
});

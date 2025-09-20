import { CANVAS_W, CANVAS_H } from './canvas.js';
import { makeChunk, CHUNK_SIZE } from './world.js';

export const player = {
  x: 0,
  y: 0,
  speed: 140,
  size: 36,
  facing: 0,
  variant: 0 // 0=brown, 1=gray
};

export let unlockedGray = false;
export let activeVariant = 0;

export function unlockGray() {
  unlockedGray = true;
}

export function switchVariant() {
  if(unlockedGray) {
    activeVariant = (activeVariant + 1) % 2;
    player.variant = activeVariant;
  }
}

export function movePlayer(dx, dy, dt) {
  const mag = Math.hypot(dx, dy);
  if(mag > 0.001) {
    dx /= mag; 
    dy /= mag;
    player.facing = Math.atan2(dy, dx);
    let nx = player.x + dx * player.speed * dt;
    let ny = player.y + dy * player.speed * dt;

    // Simple collision with trees
    const pr = player.size * 0.45;
    let collided = false;
    const pcx = Math.floor(player.x / CHUNK_SIZE);
    const pcy = Math.floor(player.y / CHUNK_SIZE);
    
    for(let dx=-1; dx<=1; dx++) {
      for(let dy=-1; dy<=1; dy++) {
        const chunk = makeChunk(pcx+dx, pcy+dy);
        for(const t of chunk.trees) {
          const tw = t.size;
          const th = t.size;
          if(collidesCircleRect(nx, ny, pr, t.x - tw/2, t.y - th/2, tw, th)) {
            collided = true;
            break;
          }
        }
        if(collided) break;
      }
      if(collided) break;
    }
    
    if(!collided) {
      player.x = nx;
      player.y = ny;
    }
  }
}

function collidesCircleRect(cx, cy, r, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx+rw));
  const closestY = Math.max(ry, Math.min(cy, ry+rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx*dx + dy*dy <= r*r;
}


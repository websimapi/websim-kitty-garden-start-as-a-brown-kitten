import { player } from './player.js';
import { makeChunk, CHUNK_SIZE } from './world.js';
import { showPickup } from './ui.js';
import { unlockGray } from './player.js';

export let score = 0;

const COLLECT_RADIUS = 36;
const ACTION_RADIUS = 64;

export function collectAction() {
  const pcx = Math.floor(player.x / CHUNK_SIZE);
  const pcy = Math.floor(player.y / CHUNK_SIZE);
  
  for(let dx=-1; dx<=1; dx++) {
    for(let dy=-1; dy<=1; dy++) {
      const chunk = makeChunk(pcx+dx, pcy+dy);
      for(let i = chunk.items.length - 1; i >= 0; i--) {
        const it = chunk.items[i];
        const d = Math.hypot(player.x - it.x, player.y - it.y);
        if(d <= COLLECT_RADIUS + it.r) {
          chunk.items.splice(i, 1);
          score++;
          player.size = Math.min(88, player.size + 4);
          showPickup('Golden Orb');
          
          if(score >= 10) {
            unlockGray();
            showPickup('Gray Kitten Unlocked!');
          }
          
          if(score % 2 === 0) {
            const ang = Math.random() * Math.PI * 2;
            const dist = 24 + Math.random() * 56;
            const sx = player.x + Math.cos(ang) * dist;
            const sy = player.y + Math.sin(ang) * dist;
            const ssp = 80 + Math.random() * 120;
            chunk.items.push({
              x: sx, y: sy, r: 10, collected: false, 
              vx: Math.cos(ang) * ssp, vy: Math.sin(ang) * ssp, bounce: 0.5
            });
            showPickup('Bonus Orb');
          }
          return;
        }
      }
    }
  }
}

export function performAction() {
  const pcx = Math.floor(player.x / CHUNK_SIZE);
  const pcy = Math.floor(player.y / CHUNK_SIZE);
  
  for(let dx=-1; dx<=1; dx++) {
    for(let dy=-1; dy<=1; dy++) {
      const chunk = makeChunk(pcx+dx, pcy+dy);
      for(const t of chunk.trees) {
        const d = Math.hypot(player.x - t.x, player.y - t.y);
        if(d <= ACTION_RADIUS + (t.size/2)) {
          t._shakeTime = 0.001;
          t._shakeDuration = 800 + Math.floor(Math.random() * 400);
          t._shakeStrength = 6 + Math.random() * 8;
          t._dropped = t._dropped || 0;
          
          if(t._dropped < 2 && Math.random() < 0.4) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 90 + Math.random() * 140;
            const itx = t.x + Math.cos(angle) * (t.size/2 + 6);
            const ity = t.y + Math.sin(angle) * (t.size/2 + 6);
            chunk.items.push({
              x: itx, y: ity, r: 10, collected: false,
              vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, bounce: 0.5
            });
            t._dropped++;
            showPickup('Fell Out');
          }
        }
      }
    }
  }
}

export function updateItemPhysics(dt) {
  const pcx = Math.floor(player.x / CHUNK_SIZE);
  const pcy = Math.floor(player.y / CHUNK_SIZE);
  
  for(let dx=-2; dx<=2; dx++) {
    for(let dy=-2; dy<=2; dy++) {
      const chunk = makeChunk(pcx+dx, pcy+dy);
      for(const it of chunk.items) {
        it.vx = it.vx || 0;
        it.vy = it.vy || 0;
        it.vx *= Math.max(0, 1 - 3*dt);
        it.vy *= Math.max(0, 1 - 3*dt);
        it.x += it.vx * dt;
        it.y += it.vy * dt;
        
        if(Math.hypot(it.vx, it.vy) < 8) {
          it.vx *= 0.85;
          it.vy *= 0.85;
        }
      }
    }
  }
}


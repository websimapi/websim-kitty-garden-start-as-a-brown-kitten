// Main game loop and coordination
import { loadImages } from './assets.js';
import { canvas, ctx, cam, resizeCanvas } from './canvas.js';
import { ensureChunks, makeChunk, CHUNK_SIZE } from './world.js';
import { player, movePlayer } from './player.js';
import { setupKeyboard, setupJoystick, setupGamepad, getMovementInput } from './input.js';
import { updateItemPhysics } from './items.js';
import { renderHUD } from './ui.js';
import { images } from './assets.js';

let last = performance.now();
let debugOn = false;

// Setup controls
const toggleDebug = document.getElementById('toggleDebug');
const resetBtn = document.getElementById('resetBtn');

toggleDebug.addEventListener('change', e => debugOn = toggleDebug.checked);
resetBtn.addEventListener('click', () => {
  player.x = 0;
  player.y = 0;
  ensureChunks(player.x, player.y, 2);
});

function step(ts) {
  const dt = Math.min(0.04, (ts - last)/1000);
  last = ts;

  // Update camera
  const cw = canvas.width, ch = canvas.height;
  cam.x = Math.max(0, Math.min(999999, player.x - cw/2));
  cam.y = Math.max(0, Math.min(999999, player.y - ch/2));

  // Handle input and move player
  const {dx, dy} = getMovementInput();
  movePlayer(dx, dy, dt);

  // Update physics
  updateItemPhysics(dt);

  // Ensure chunks
  ensureChunks(player.x, player.y, 2);
  
  render();
  requestAnimationFrame(step);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(-cam.x, -cam.y);

  // Background
  const drawX0 = Math.floor(cam.x/CHUNK_SIZE-2)*CHUNK_SIZE;
  const drawY0 = Math.floor(cam.y/CHUNK_SIZE-2)*CHUNK_SIZE;
  const drawW = canvas.width + CHUNK_SIZE*4;
  const drawH = canvas.height + CHUNK_SIZE*4;
  ctx.fillStyle = '#e6f6e6';
  ctx.fillRect(drawX0, drawY0, drawW, drawH);

  // Draw chunks
  const minCx = Math.floor((cam.x - CHUNK_SIZE)/CHUNK_SIZE);
  const maxCx = Math.floor((cam.x + canvas.width + CHUNK_SIZE)/CHUNK_SIZE);
  const minCy = Math.floor((cam.y - CHUNK_SIZE)/CHUNK_SIZE);
  const maxCy = Math.floor((cam.y + canvas.height + CHUNK_SIZE)/CHUNK_SIZE);
  
  for(let cx=minCx; cx<=maxCx; cx++) {
    for(let cy=minCy; cy<=maxCy; cy++) {
      const chunk = makeChunk(cx, cy);
      
      // Items
      for(const it of chunk.items) {
        ctx.beginPath();
        ctx.fillStyle = '#ffd54f';
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 8;
        ctx.arc(it.x, it.y, it.r, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.stroke();
      }
      
      // Trees
      for(const t of chunk.trees) {
        const img = images.tree;
        const w = t.size;
        
        if(t._shakeTime && t._shakeDuration) {
          t._shakeTime += Math.min(40, t._shakeDuration);
        }
        
        let sx = 0, sy = 0;
        if(t._shakeTime && t._shakeDuration) {
          const p = Math.min(1, t._shakeTime / t._shakeDuration);
          const strength = (1 - p) * (t._shakeStrength || 6);
          sx = (Math.random()*2-1) * strength;
          sy = (Math.random()*2-1) * strength;
          if(p >= 1) {
            t._shakeTime = 0;
            t._shakeDuration = 0;
          }
        }
        ctx.drawImage(img, t.x - w/2 + sx, t.y - w/2 + sy, w, w);
      }
    }
  }

  // Draw kitten
  const k = player.variant === 0 ? images.kitten : images.kittenGray;
  const ks = player.size;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.facing + Math.PI/2);
  const pop = player._popScale || 1;
  ctx.scale(pop, pop);
  ctx.drawImage(k, -ks/2, -ks/2, ks, ks);
  ctx.restore();

  ctx.restore();
  
  renderHUD(debugOn);
}

// Boot
(async function init() {
  resizeCanvas();
  await loadImages();
  player.x = 0;
  player.y = 0;
  ensureChunks(player.x, player.y, 2);
  setupKeyboard();
  setupJoystick();
  setupGamepad();
  requestAnimationFrame(step);
})();
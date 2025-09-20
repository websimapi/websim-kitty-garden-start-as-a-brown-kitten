import { score } from './items.js';
import { player } from './player.js';
import { cam, ctx, canvas } from './canvas.js';

const pickupToastEl = document.getElementById('pickupToast');

export function showPickup(label) {
  if(!pickupToastEl) return;
  pickupToastEl.innerHTML = `<div class="icon" aria-hidden="true"></div><div class="label">+1 ${label}</div>`;
  pickupToastEl.classList.add('show');
  clearTimeout(pickupToastEl._hideTimeout);
  pickupToastEl._hideTimeout = setTimeout(() => {
    pickupToastEl.classList.remove('show');
  }, 1200);
}

export function renderHUD(debugOn) {
  // Score HUD
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(10, 10, 86, 34);
  ctx.fillStyle = '#111';
  ctx.font = '16px Noto Sans, Arial';
  ctx.fillText(`Items: ${score}`, 18, 33);

  if(debugOn) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.font = '12px Arial';
    ctx.fillText(`x:${player.x.toFixed(1)} y:${player.y.toFixed(1)} camX:${cam.x.toFixed(1)} camY:${cam.y.toFixed(1)}`, 10, 58);
  }
}


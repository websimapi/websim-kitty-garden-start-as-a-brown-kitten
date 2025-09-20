
```javascript
import { collectAction, performAction } from './items.js';
import { switchVariant, player } from './player.js';

export const keys = {};
export let joystickDir = {x: 0, y: 0};
let joystickManager = null;

export function setupKeyboard() {
  window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if(e.key.toLowerCase() === 'x') {
      performAction();
      e.preventDefault();
    }
    if(e.key.toLowerCase() === 'a') {
      collectAction();
      e.preventDefault();
    }
    if(e.key.toLowerCase() === 'q') {
      switchVariant();
      e.preventDefault();
    }
  }); 
  
  window.addEventListener('keyup', e => { 
    keys[e.key.toLowerCase()] = false; 
  });
}

export function setupJoystick() {
  const joystickEl = document.getElementById('joystick');
  if('ontouchstart' in window) {
    joystickEl.style.display = 'block';
    joystickEl.style.pointerEvents = 'auto';

    if(!(window.nipplejs || window.NippleJS || window.nipple)) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/nipplejs@0.9.0/dist/nipplejs.min.js';
      s.async = true;
      document.head.appendChild(s);
      s.onload = initNipple;
      s.onerror = () => console.warn('Failed to load nipplejs; joystick disabled');
    } else {
      initNipple();
    }

    function initNipple() {
      const nib = window.nipplejs || window.NippleJS || window.nipple;
      if(!nib || !nib.create) {
        console.warn('nipplejs not found on window; joystick disabled');
        return;
      }
      joystickManager = nib.create({
        zone: joystickEl,
        mode: 'static',
        position: {left: '70px', bottom: '70px'},
        color: '#444',
        size: 110,
        restOpacity: 0.9
      });
      joystickManager.on('move', (evt, data) => {
        if(data && data.vector && typeof data.vector.x === 'number' && typeof data.vector.y === 'number') {
          joystickDir = { x: data.vector.x, y: -data.vector.y };
        } else {
          const angle = data && data.angle ? data.angle.radian : 0;
          const dist = Math.min(1, (data && data.distance || 0) / 50);
          joystickDir = { x: Math.cos(angle)*dist, y: -Math.sin(angle)*dist };
        }
      });
      joystickManager.on('end', () => { joystickDir = {x:0, y:0}; });
    }
  }
}

export function setupGamepad() {
  const btnA = document.getElementById('btnA');
  const btnB = document.getElementById('btnB');
  const btnX = document.getElementById('btnX');
  const btnY = document.getElementById('btnY');

  const press = (el, fn) => {
    el.addEventListener('pointerdown', e => { e.preventDefault(); fn(); });
    el.addEventListener('click', e => { e.preventDefault(); fn(); });
  };

  press(btnX, () => performAction());
  press(btnA, () => collectAction());
  press(btnB, () => doAfrica());
  press(btnY, () => switchVariant());
}

function doAfrica() {
  // screen flash
  const flash = document.createElement('div');
  Object.assign(flash.style, {
    position:'fixed', left:0, top:0, width:'100%', height:'100%',
    background:'rgba(255,235,59,0.6)', zIndex:9999,
    pointerEvents:'none', opacity:1, transition:'opacity 300ms ease'
  });
  document.body.appendChild(flash);
  setTimeout(() => flash.style.opacity=0, 50);
  setTimeout(() => flash.remove(), 350);

  // pop-scale kitten for bounce
  player._popScale = 1.4;
  setTimeout(() => player._popScale = 1, 300);

  // music-note particles
  for(let i=0; i<20; i++) {
    const note = document.createElement('div');
    const canvas = document.getElementById('gameCanvas');
    const cam = { x: 0, y: 0 }; // simplified for this function
    const x = player.x - cam.x + canvas.getBoundingClientRect().left;
    const y = player.y - cam.y + canvas.getBoundingClientRect().top;
    const size = 14 + Math.random()*18;
    const life = 800 + Math.random()*600;
    const angle = Math.random()*Math.PI*2;
    const speed = 60 + Math.random()*120;
    Object.assign(note.style, {
      position:'absolute', left:x+'px', top:y+'px',
      width:size+'px', height:size+'px',
      backgroundImage:`url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ffeb3b' d='M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6z'/%3E%3C/svg%3E\")`,
      backgroundSize:'contain', backgroundRepeat:'no-repeat',
      pointerEvents:'none', zIndex:9998,
      transform:`translate(-50%,-50%) rotate(${Math.random()*360}deg)`,
      opacity:1, transition:`transform ${life}ms ease-out, opacity ${life}ms ease-out`
    });
    document.body.appendChild(note);
    setTimeout(() => {
      note.style.transform = `translate(${Math.cos(angle)*speed}px, ${Math.sin(angle)*speed}px) rotate(${Math.random()*720}deg)`;
      note.style.opacity = 0;
    }, 50);
    setTimeout(() => note.remove(), life+100);
  }
}

export function getMovementInput() {
  let dx = 0, dy = 0;
  if(keys['arrowup']||keys['w']) dy -= 1;
  if(keys['arrowdown']||keys['s']) dy += 1;
  if(keys['arrowleft']||keys['a']) dx -= 1;
  if(keys['arrowright']||keys['d']) dx += 1;
  
  if(joystickDir.x || joystickDir.y) {
    dx = joystickDir.x;
    dy = joystickDir.y;
  }
  
  return {dx, dy};
}
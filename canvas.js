// Canvas setup and camera management
export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

export const cam = { x: 0, y: 0 };

export function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width);
  canvas.height = Math.floor(rect.height);
}

export const CANVAS_W = () => canvas.width;
export const CANVAS_H = () => canvas.height;

window.addEventListener('resize', resizeCanvas);


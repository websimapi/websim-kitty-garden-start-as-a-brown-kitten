// World generation and chunk management
export const CHUNK_SIZE = 600;

export const world = {
  chunkMap: new Map()
};

export function getChunkKey(cx, cy) { 
  return `${cx},${cy}`; 
}

export function makeChunk(cx, cy) {
  const key = getChunkKey(cx, cy);
  if(world.chunkMap.has(key)) return world.chunkMap.get(key);
  
  const seed = Math.abs(((cx*73856093) ^ (cy*19349663))|0);
  let seedVal = seed || 1;
  const rand = (n=1) => { 
    seedVal = (seedVal*1664525 + 1013904223) % 4294967296; 
    return (seedVal/4294967296)*n; 
  };

  const trees = [];
  const items = [];

  // Generate trees
  const tcount = 8 + Math.floor(Math.abs(Math.sin(cx*37.3 + cy*17.9))*8);
  for(let i=0; i<tcount; i++) {
    const x = cx*CHUNK_SIZE + rand()*CHUNK_SIZE;
    const y = cy*CHUNK_SIZE + rand()*CHUNK_SIZE;
    trees.push({x, y, size: 40 + Math.floor(rand()*28)});
  }

  // Generate items
  const icount = 3 + Math.floor(Math.abs(Math.cos(cx*13.7 + cy*29.1))*4);
  for(let i=0; i<icount; i++) {
    const x = cx*CHUNK_SIZE + rand()*(CHUNK_SIZE-40) + 20;
    const y = cy*CHUNK_SIZE + rand()*(CHUNK_SIZE-40) + 20;
    items.push({x, y, r:10, collected:false});
  }

  const chunk = {trees, items};
  world.chunkMap.set(key, chunk);
  return chunk;
}

export function ensureChunks(playerX, playerY, radius = 1) {
  const pcx = Math.floor(playerX / CHUNK_SIZE);
  const pcy = Math.floor(playerY / CHUNK_SIZE);
  const active = [];
  for(let dx=-radius; dx<=radius; dx++) {
    for(let dy=-radius; dy<=radius; dy++) {
      active.push(makeChunk(pcx+dx, pcy+dy));
    }
  }
  return active;
}
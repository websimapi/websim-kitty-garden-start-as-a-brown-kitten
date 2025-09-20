// Asset loading and management
const assetPaths = {
  kitten: 'kitten.png',
  kittenGray: 'kitten-gray.png',
  tree: 'tree.png'
};

export let images = {};

export function loadImages(list = assetPaths) {
  const names = Object.keys(list);
  let loaded = 0;
  return new Promise((res, rej) => {
    names.forEach(name => {
      const img = new Image();
      img.src = list[name];
      img.onload = () => {
        images[name] = img;
        loaded++;
        if(loaded === names.length) res(images);
      };
      img.onerror = rej;
    });
  });
}
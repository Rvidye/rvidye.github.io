// Renders public/favicon.svg into the raster icons some browsers and crawlers
// still ask for. Run after changing the SVG: npm run icons
//
//   public/apple-touch-icon.png   180×180, for iOS home screens
//   public/favicon.ico            32×32 PNG inside an ICO container, for /favicon.ico requests

import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const pub = join(resolve(import.meta.dirname, '..'), 'public');
const svg = readFileSync(join(pub, 'favicon.svg'));

const render = (size) => sharp(svg, { density: 72 * (size / 32) }).resize(size, size).png().toBuffer();

writeFileSync(join(pub, 'apple-touch-icon.png'), await render(180));

// ICO header (6 bytes) + one directory entry (16 bytes) + the PNG itself.
const png = await render(32);
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); // reserved
ico.writeUInt16LE(1, 2); // type: icon
ico.writeUInt16LE(1, 4); // one image
ico.writeUInt8(32, 6); // width
ico.writeUInt8(32, 7); // height
ico.writeUInt8(0, 8); // no palette
ico.writeUInt8(0, 9); // reserved
ico.writeUInt16LE(1, 10); // colour planes
ico.writeUInt16LE(32, 12); // bits per pixel
ico.writeUInt32LE(png.length, 14); // image size
ico.writeUInt32LE(22, 18); // image offset
writeFileSync(join(pub, 'favicon.ico'), Buffer.concat([ico, png]));

console.log('Wrote public/apple-touch-icon.png and public/favicon.ico');

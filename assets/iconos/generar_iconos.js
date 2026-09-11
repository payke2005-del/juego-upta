// ==========================================================================
// GENERADOR DE ICONOS PWA - PIXEL VOCACIONAL (Node.js, sin dependencias)
// ==========================================================================
// Genera icon-192.png e icon-512.png (PNG RGB válido).
//
// Diseño: birrete de graduación pixel-art sobre fondo rojo UPTA (#cc0000).
// El dibujo ocupa el 70% central del lienzo para cumplir la "zona segura"
// de los iconos maskable (Android recorta las esquinas con formas curvas).
//
// USO:  node assets/iconos/generar_iconos.js
//
// Si prefieres tu propia arte: reemplaza icon-192.png e icon-512.png
// manteniendo EXACTAMENTE los mismos nombres y medidas.
// ==========================================================================

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// --- Paleta de colores (RGB) ---
const BG = [204, 0, 0];   // Fondo rojo UPTA (#cc0000)
const K  = [26, 18, 8];   // Birrete (casi negro)
const D  = [62, 46, 26];  // Banda/base del birrete
const Y  = [255, 204, 0]; // Borla amarilla (#ffcc00)

// --- Diseño en cuadrícula 16x16 ('.' = color de fondo) ---
const PIXEL_MAP = [
  "................",
  "................",
  "...KKKKKKKKKK...",
  "..KKKKKKKKKKKK..",
  ".KKKKKKKKKKKKKK.",
  ".KKKKKKKKKKKKKK.",
  "..KKKKKKKKKKKK..",
  "...KKKKKKKKKK...",
  "..Y...DDDDDD....",
  "..Y...DDDDDD....",
  "..Y...DDDDDD....",
  "..Y...DDDDDD....",
  "..Y....DDDD.....",
  ".YY.....DD......",
  ".YYY............",
  "................",
];

const COLORS = { K, D, Y };

// --- CRC-32 (requerido por el formato PNG) ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// Construye un chunk PNG: [longitud][tipo][datos][crc]
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Dibuja la cuadrícula pixel-art en un buffer RGB del tamaño indicado
function buildImage(size) {
  // Fondo completo (imprescindible para iconos "maskable")
  const px = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    px[i * 3] = BG[0];
    px[i * 3 + 1] = BG[1];
    px[i * 3 + 2] = BG[2];
  }

  // El dibujo ocupa el 70% central del lienzo (zona segura maskable)
  const offset = size * 0.15;
  const cell = (size * 0.70) / 16;

  PIXEL_MAP.forEach((row, r) => {
    for (let c = 0; c < 16; c++) {
      const color = COLORS[row[c]];
      if (!color) continue;
      const x0 = Math.floor(offset + c * cell);
      const x1 = Math.floor(offset + (c + 1) * cell);
      const y0 = Math.floor(offset + r * cell);
      const y1 = Math.floor(offset + (r + 1) * cell);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * size + x) * 3;
          px[idx] = color[0];
          px[idx + 1] = color[1];
          px[idx + 2] = color[2];
        }
      }
    }
  });
  return px;
}

// Escribe el PNG final (RGB 8 bits, sin entrelazado)
function writePng(file, size, px) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);   // ancho
  ihdr.writeUInt32BE(size, 4);   // alto
  ihdr[8] = 8;                   // profundidad de bits
  ihdr[9] = 2;                   // color type 2 = RGB truecolor
  // bytes 10-12 quedan en 0 (compresión, filtro, entrelazado)

  // Cada fila lleva un byte de filtro (0 = none) delante
  const stride = size * 3 + 1;
  const raw = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    px.copy(raw, y * stride + 1, y * size * 3, (y + 1) * size * 3);
  }

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // firma PNG
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);

  fs.writeFileSync(file, png);
  console.log(`OK  ${file}  (${size}x${size}, ${png.length} bytes)`);
}

// --- Generación de los dos tamaños requeridos por el manifest ---
const here = __dirname;
for (const s of [192, 512]) {
  writePng(path.join(here, `icon-${s}.png`), s, buildImage(s));
}
console.log('Iconos generados correctamente.');
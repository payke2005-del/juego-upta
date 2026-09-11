# -*- coding: utf-8 -*-
"""
GENERADOR DE ICONOS PWA - PIXEL VOCACIONAL
==========================================
Genera icon-192.png e icon-512.png (PNG RGB, sin dependencias externas).

Diseño: birrete de graduación pixel-art sobre fondo rojo UPTA (#cc0000).
El dibujo ocupa el 70% central del lienzo para cumplir la "zona segura"
de los iconos maskable (Android recorta esquinas con formas circulares).

USO:
    python generar_iconos.py

Si quieres usar tu propia arte: reemplaza icon-192.png e icon-512.png
manteniendo EXACTAMENTE los mismos nombres y medidas (192x192 y 512x512).
"""

import zlib
import struct
import os

# --- Paleta de colores (RGB) ---
BG = (204, 0, 0)     # Fondo rojo UPTA (#cc0000)
K  = (26, 18, 8)     # Birrete (casi negro)
D  = (62, 46, 26)    # Banda/base del birrete
Y  = (255, 204, 0)   # Borla amarilla (#ffcc00)

# --- Diseño en cuadrícula 16x16 ('.' = color de fondo) ---
PIXEL_MAP = [
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
]

COLORS = {'K': K, 'D': D, 'Y': Y}


def build_image(size):
    """Construye la imagen como matriz de píxeles RGB."""
    # Fondo completo (imprescindible para iconos "maskable")
    px = [[BG for _ in range(size)] for _ in range(size)]

    # Dibujar la cuadrícula en el 70% central del lienzo
    offset = size * 0.15
    cell = (size * 0.70) / 16.0

    for r, row in enumerate(PIXEL_MAP):
        for c, ch in enumerate(row):
            color = COLORS.get(ch)
            if not color:
                continue
            x0 = int(offset + c * cell)
            x1 = int(offset + (c + 1) * cell)
            y0 = int(offset + r * cell)
            y1 = int(offset + (r + 1) * cell)
            for y in range(y0, y1):
                for x in range(x0, x1):
                    px[y][x] = color
    return px


def write_png(path, size, px):
    """Escribe un PNG válido (RGB 8 bits) usando solo la librería estándar."""
    def chunk(typ, data):
        return (struct.pack('>I', len(data)) + typ + data +
                struct.pack('>I', zlib.crc32(typ + data) & 0xffffffff))

    # IHDR: 8 bits por canal, color type 2 (RGB truecolor)
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)

    # Cada fila lleva un byte de filtro (0 = none) delante
    raw = b''.join(b'\x00' + bytes(b for p in fila for b in p) for fila in px)

    png = (b'\x89PNG\r\n\x1a\n' +
           chunk(b'IHDR', ihdr) +
           chunk(b'IDAT', zlib.compress(raw, 9)) +
           chunk(b'IEND', b''))

    with open(path, 'wb') as f:
        f.write(png)
    print(f"OK  {path}  ({size}x{size}, {os.path.getsize(path)} bytes)")


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    for s in (192, 512):
        write_png(os.path.join(here, f'icon-{s}.png'), s, build_image(s))
    print("Iconos generados correctamente.")
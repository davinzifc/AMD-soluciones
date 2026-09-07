#!/usr/bin/env python3
"""
Normalización de los logos de clientes de AMD — mockup home-page-redesign.

    python3 prepare-logos.py ~/Downloads/Logos

EL PROBLEMA
-----------
Los 13 logos llegaron como los envían las empresas: PNG de 4.8 MB junto a uno
de 208 px, ratios de 0.82 a 4.18 (5.1x de dispersión), un JPG con fondo negro
incrustado, uno rosa pálido invisible sobre papel, y líneas de recorte pegadas
al arte. Puestos en color unos al lado de otros parecen un mercadillo, y eso
resta credibilidad en vez de sumarla — que es justo lo contrario de lo que un
muro de clientes tiene que hacer.

LA DECISIÓN
-----------
Monocromo. Cada logo se convierte en una MÁSCARA de un solo canal (alfa) y el
color lo pone el CSS con `mask-image`. Eso resuelve de golpe:

  · el caos cromático — todos comparten la tinta de la página;
  · el fondo negro incrustado y el rosa invisible — dejan de ser un problema
    de color y pasan a ser un problema de forma, que sí se puede normalizar;
  · los halos de JPEG y los recortes desiguales — desaparecen con la silueta;
  · el tema claro/oscuro — la MISMA máscara sirve en las dos variantes de la
    página, porque el color viene de `currentColor`, no del archivo.

Es además el tratamiento estándar de un muro de "confían en nosotros", así que
no sorprende a nadie: nadie espera ver el color de marca en esa retícula.

LAS TRES POLÍTICAS DE MÁSCARA
-----------------------------
Ningún criterio único sirve para los 13. Se eligieron mirando las tres opciones
renderizadas lado a lado, logo por logo:

  A · silueta por alfa      m = α
      Para marcas que son una forma sólida. Conserva las contraformas que ya
      venían caladas en el alfa (el icono de D&P dentro del cuadrado negro).

  B · tinta                 m = α · (1 − L)
      Para logos con detalle CLARO que la silueta destruiría: el loto de Loto
      Group se convertía en un borrón, las facetas de Siddhi también.
      Gesap se probó con B para salvar el distintivo "ERP", pero en el muro la
      G quedaba como una mancha gris; con A la marca se lee "Gesap inc." y el
      "ERP" —que en el original ya viene cortado por el borde— se pierde. Se
      prefiere legible a completo.

  C · luz                   m = α · L
      Para arte claro sobre fondo oscuro incrustado: Obed Services llegó como
      JPG con el fondo negro pegado; la silueta habría sido un rectángulo.

Después de aplicar la política, la máscara se renormaliza contra su percentil
99 — si no, B y C salen sistemáticamente más pálidas que A y la retícula queda
desequilibrada sin que se vea por qué.

LIMPIEZA DE ASTILLAS DE RECORTE
-------------------------------
Se descarta un componente conexo sólo si cumple LAS TRES condiciones: menos del
3 % de la tinta, alargamiento mayor de 15:1, y toca el borde de la imagen.

Las tres juntas son necesarias. Un umbral de tamaño a secas —que fue el primer
intento— borró 26 componentes en Ballet Capital y 14 en D&P Capital: eran las
letras de los taglines "FORMACIÓN, CREACIÓN Y FOMENTO" e "INVERSIONES S.A.S".
Y sin la condición de borde tampoco basta: la barra de recorte de KAES pesa
2.35 % de la tinta, muy por encima de cualquier umbral que respete un tagline.

NORMALIZACIÓN ÓPTICA
--------------------
Dos logos con el mismo alto no pesan lo mismo si uno es un wordmark fino y el
otro un símbolo macizo. Se ajusta primero a la caja y después se aplica una
corrección suave por área de tinta, con exponente 0.35 y tope ±, para que un
logo muy cargado no aplaste la retícula ni uno muy fino la agujeree. Exponente
1.0 (igualar el área de tinta) hace lo contrario de lo que promete: agranda los
logos de línea fina hasta que dominan el muro.
"""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

OUT = os.path.dirname(os.path.abspath(__file__))

# archivo original: (política, slug, crop previo en px, nombre para el alt)
POLICY = {
    'Logo Caval Compliance Corporation SAS.png': ('A', 'caval-compliance',      0, 'Caval Compliance Corporation'),
    'Logo Digicort SAS.png':                     ('A', 'digicort',              0, 'Digicort'),
    'Logo DyP Capital Inversiones SAS.png':      ('A', 'dyp-capital',           0, 'D&P Capital Inversiones'),
    'Logo Fundacion Ballet Capital.png':         ('A', 'ballet-capital',        0, 'Fundación Ballet Capital'),
    'Logo Gesap ERP INC SAS.png':                ('A', 'gesap-erp',             0, 'Gesap ERP'),
    'Logo Glowing Digital Cloud.png':            ('A', 'glowing-digital-cloud', 0, 'Glowing Digital Cloud'),
    'Logo KAES SAS.png':                         ('A', 'kaes',                 14, 'KAES'),
    'Logo Loto Consulting.png':                  ('B', 'loto-group',            0, 'Loto Group'),
    'Logo NFES.png':                             ('A', 'nfes-solutions',        0, 'NFES Solutions'),
    'Logo Obedservices.jpg':                     ('C', 'obed-services',         0, 'Obed Services'),
    'Logo SK Glam SAS.png':                      ('A', 'sk-glam',               0, 'SK Glam'),
    'Logo Siddhi SAS.png':                       ('B', 'siddhi-autotech',       0, 'Siddhi Autotech'),
    'Logo Virtual Cloud Worldd.png':             ('A', 'virtual-cloud-world',   0, 'Virtual Cloud World'),
}

BOX_W, BOX_H = 168, 68   # caja de referencia en px CSS
SCALE = 3                # se exporta a 3x para pantallas densas


def mask_of(path, pol, crop):
    im = Image.open(path).convert('RGBA')
    if crop:
        im = im.crop((crop, crop, im.width - crop, im.height - crop))
    arr = np.asarray(im).astype(float)
    alpha = arr[..., 3] / 255.0
    rgb = arr[..., :3] / 255.0
    lum = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    m = {'A': alpha, 'B': alpha * (1 - lum), 'C': alpha * lum}[pol]
    hi = np.percentile(m[m > 0.02], 99) if (m > 0.02).any() else 1.0
    return np.clip(m / max(hi, 1e-6), 0, 1)


def drop_crop_slivers(m):
    """Diminuto + absurdamente alargado + tocando el borde. Las tres, o no se toca."""
    lab, n = ndimage.label(m > 0.15)
    if n <= 1:
        return m, []
    total = (m > 0.15).sum()
    H, W = m.shape
    keep = np.zeros(m.shape, bool)
    dropped = []
    for i in range(1, n + 1):
        comp = lab == i
        ys, xs = np.where(comp)
        bw, bh = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
        elong = max(bw, bh) / max(1, min(bw, bh))
        frac = comp.sum() / total
        edge = xs.min() <= 2 or xs.max() >= W - 3 or ys.min() <= 2 or ys.max() >= H - 3
        if frac < 0.03 and elong > 15 and edge:
            dropped.append(f'{bw}x{bh} ({frac * 100:.2f}% de tinta, {elong:.0f}:1)')
        else:
            keep |= comp
    return m * keep, dropped


def trim(m, thr=0.04):
    ys, xs = np.where(m > thr)
    return m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def main(src_dir):
    prepared = {}
    for fname, (pol, slug, crop, name) in POLICY.items():
        path = os.path.join(src_dir, fname)
        if not os.path.exists(path):
            sys.exit(f'falta el original: {path}')
        m, dropped = drop_crop_slivers(mask_of(path, pol, crop))
        m = trim(m)
        h, w = m.shape
        s_box = min(BOX_W / w, BOX_H / h)
        prepared[slug] = dict(m=m, s_box=s_box, name=name, pol=pol, dropped=dropped, src=fname,
                              ink_box=float(m.mean()) * round(w * s_box) * round(h * s_box))

    target = float(np.median([p['ink_box'] for p in prepared.values()]))

    meta = []
    for slug, p in sorted(prepared.items()):
        m = p['m']
        h, w = m.shape
        corr = min(1.15, max(0.78, (target / max(p['ink_box'], 1)) ** 0.35))
        s = p['s_box'] * corr
        dw, dh = max(1, round(w * s)), max(1, round(h * s))
        alpha = Image.fromarray((m * 255).astype(np.uint8)).resize((dw * SCALE, dh * SCALE), Image.LANCZOS)
        px = np.zeros((alpha.size[1], alpha.size[0], 4), np.uint8)
        px[..., :3] = 255                      # el color lo pone el CSS
        px[..., 3] = np.asarray(alpha)
        Image.fromarray(px).save(os.path.join(OUT, f'{slug}.webp'), 'WEBP', lossless=True, quality=100)
        meta.append(dict(slug=slug, name=p['name'], pol=p['pol'], src=p['src'],
                         w=dw, h=dh, corr=round(corr, 2),
                         ink=round(float(m.mean()) * dw * dh),
                         upscale=round(dw * SCALE / w, 2), dropped=p['dropped'],
                         kb=round(os.path.getsize(os.path.join(OUT, f'{slug}.webp')) / 1024, 1)))

    with open(os.path.join(OUT, 'logos.json'), 'w') as fh:
        json.dump(meta, fh, indent=1, ensure_ascii=False)

    print(f"{'slug':<24}{'pol':<5}{'caja':<10}{'corr':<7}{'tinta':<8}{'escala':<9}{'peso'}")
    for m in meta:
        flag = '  ⚠ ampliado' if m['upscale'] > 1.15 else ''
        caja = '{}x{}'.format(m['w'], m['h'])
        print("{:<24}{:<5}{:<10}{:<7}{:<8}{:<9}{}KB{}".format(
            m['slug'], m['pol'], caja, str(m['corr']) + 'x', m['ink'],
            str(m['upscale']) + 'x', m['kb'], flag))
        for d in m['dropped']:
            print(f"    astilla de recorte descartada: {d}")
    inks = [m['ink'] for m in meta]
    print(f"\ndispersión de tinta {max(inks) / min(inks):.1f}x · "
          f"caja máxima {max(m['w'] for m in meta)}x{max(m['h'] for m in meta)} · "
          f"total {round(sum(m['kb'] for m in meta), 1)} KB")


if __name__ == '__main__':
    main(os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else '~/Downloads/Logos'))

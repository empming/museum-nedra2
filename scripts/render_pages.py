"""Render selected pages of the Seligdar artbook as WebP images.
Captures layout/typography/infographics, not just embedded photos.
"""

import sys
from pathlib import Path
from io import BytesIO

import fitz
from PIL import Image

PDF_PATH = Path(sys.argv[1] if len(sys.argv) > 1 else
                r"C:\Users\admin\Downloads\azga9-Seligdar_2015.pdf")
OUT_DIR = Path(__file__).resolve().parent.parent / "assets" / "img" / "artbook"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Render every other page (skip duplicate spreads), starting page 4
PAGES = list(range(4, 83, 2))
ZOOM = 1.6
MAX_WIDTH = 1400
WEBP_QUALITY = 75

doc = fitz.open(PDF_PATH)
saved = 0
for p in PAGES:
    if p > len(doc):
        continue
    page = doc[p - 1]
    mat = fitz.Matrix(ZOOM, ZOOM)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    im = Image.open(BytesIO(pix.tobytes("png")))
    w, h = im.size
    if w > MAX_WIDTH:
        ratio = MAX_WIDTH / w
        im = im.resize((MAX_WIDTH, int(h * ratio)), Image.LANCZOS)
    out = OUT_DIR / f"page{p:03d}.webp"
    im.save(out, "WEBP", quality=WEBP_QUALITY, method=6)
    saved += 1
print(f"rendered: {saved}")

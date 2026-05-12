"""Extract images from the Seligdar 2015 corporate artbook PDF.

Saves images >= MIN_WIDTH px wide as WebP into assets/img/artbook/.
Naming: p{NN}_{idx}.webp (page number, image index on page).
Run from repo root: python scripts/extract_artbook.py <path-to-pdf>
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

MIN_WIDTH = 600
MIN_HEIGHT = 400
WEBP_QUALITY = 78
MAX_WIDTH = 1600

doc = fitz.open(PDF_PATH)
saved = 0
skipped_small = 0

for page_idx, page in enumerate(doc, start=1):
    images = page.get_images(full=True)
    for img_idx, info in enumerate(images, start=1):
        xref = info[0]
        try:
            pix = fitz.Pixmap(doc, xref)
            if pix.n - pix.alpha >= 4:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            img_bytes = pix.tobytes("png")
            pix = None
            im = Image.open(BytesIO(img_bytes))
            w, h = im.size
            if w < MIN_WIDTH or h < MIN_HEIGHT:
                skipped_small += 1
                continue
            if w > MAX_WIDTH:
                ratio = MAX_WIDTH / w
                im = im.resize((MAX_WIDTH, int(h * ratio)), Image.LANCZOS)
            if im.mode in ("RGBA", "P"):
                im = im.convert("RGB")
            out = OUT_DIR / f"p{page_idx:03d}_{img_idx}.webp"
            im.save(out, "WEBP", quality=WEBP_QUALITY, method=6)
            saved += 1
        except Exception as e:
            print(f"!! page {page_idx} img {img_idx}: {e}")

print(f"saved: {saved}, skipped (small): {skipped_small}")

#!/usr/bin/env python3
"""Asset pipeline for the Raka Ashok portfolio.
- Renders project PDFs (Saras, Unboxing) to per-slide JPEGs.
- Renders poster PDFs (page 1) and resizes poster PNGs to full + thumb JPEGs.
- Builds contact sheets (to /tmp) for visual review.
- Writes manifest.json consumed by the site's data layer.
"""
import os, re, json, subprocess, glob
import fitz  # PyMuPDF

BASE = "/Users/paapatype/Desktop/GD4/Raka Flaka/Raka Website "
OUT = os.path.join(BASE, "Technical Website Data")
ASSETS = os.path.join(OUT, "assets")
DESIGN = os.path.join(BASE, "Design Projects_Raka")
POSTERS_SRC = os.path.join(BASE, "Posters")
CONTACT = "/tmp/raka_contact"

for d in [ASSETS, os.path.join(ASSETS, "projects"), os.path.join(ASSETS, "posters", "full"),
          os.path.join(ASSETS, "posters", "thumb"), CONTACT]:
    os.makedirs(d, exist_ok=True)

def slugify(name):
    s = os.path.splitext(name)[0]
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s

def save_jpg(pix, path, quality=88):
    try:
        data = pix.tobytes(output="jpg", jpg_quality=quality)
        with open(path, "wb") as f:
            f.write(data)
    except Exception:
        # fallback: save png then convert via sips
        tmp = path + ".png"
        pix.save(tmp)
        subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", str(quality),
                        tmp, "--out", path], check=True, capture_output=True)
        os.remove(tmp)

def render_pdf_page(doc, pno, long_edge_px, quality=88):
    page = doc[pno]
    rect = page.rect
    le = max(rect.width, rect.height)
    zoom = long_edge_px / le
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    return pix

manifest = {"projects": [], "posters": []}

# ---------- PROJECTS ----------
PROJECTS = [
    {"slug": "saras-co", "title": "Saras Co", "file": "SARAS CO.pdf"},
    {"slug": "unboxing-blr", "title": "Unboxing BLR", "file": "UNBOXING BLR_24_Version 2.pdf"},
]
for p in PROJECTS:
    src = os.path.join(DESIGN, p["file"])
    doc = fitz.open(src)
    outdir = os.path.join(ASSETS, "projects", p["slug"])
    os.makedirs(outdir, exist_ok=True)
    pages = []
    contact_doc = fitz.open()
    for i in range(len(doc)):
        pix = render_pdf_page(doc, i, 1366, 82)
        fname = f"{i+1:02d}.jpg"
        save_jpg(pix, os.path.join(outdir, fname), 82)
        pages.append({"src": f"assets/projects/{p['slug']}/{fname}",
                      "w": pix.width, "h": pix.height})
    # contact sheet: place pages in a grid on big pages, 3 cols
    cols = 3
    cell_w, cell_h, pad = 380, 270, 12
    per_sheet = 9
    sheet_idx = 0
    n = len(doc)
    for start in range(0, n, per_sheet):
        chunk = list(range(start, min(start + per_sheet, n)))
        rows = (len(chunk) + cols - 1) // cols
        pw = cols * cell_w + (cols + 1) * pad
        ph = rows * (cell_h + 22) + pad
        cpage = contact_doc.new_page(width=pw, height=ph)
        for k, pno in enumerate(chunk):
            r, c = divmod(k, cols)
            x0 = pad + c * (cell_w + pad)
            y0 = pad + r * (cell_h + 22)
            rect = fitz.Rect(x0, y0, x0 + cell_w, y0 + cell_h)
            cpage.show_pdf_page(rect, doc, pno)
            cpage.insert_text((x0 + 2, y0 + cell_h + 14), f"p{pno+1}", fontsize=10)
        sheet_idx += 1
    contact_doc.save(os.path.join(CONTACT, f"{p['slug']}.pdf"))
    # rasterize contact sheets to jpg for viewing
    cdoc = fitz.open(os.path.join(CONTACT, f"{p['slug']}.pdf"))
    for ci in range(len(cdoc)):
        pix = render_pdf_page(cdoc, ci, 1400, 80)
        save_jpg(pix, os.path.join(CONTACT, f"{p['slug']}-sheet{ci+1}.jpg"), 80)
    manifest["projects"].append({"slug": p["slug"], "title": p["title"],
                                 "pageCount": len(doc), "pages": pages})
    doc.close()
    print(f"project {p['slug']}: {len(pages)} slides")

# ---------- POSTERS ----------
def list_posters():
    items = []
    for f in os.listdir(POSTERS_SRC):
        full = os.path.join(POSTERS_SRC, f)
        if not os.path.isfile(full):
            continue
        ext = os.path.splitext(f)[0:0]  # placeholder
        low = f.lower()
        if low.endswith(".pdf") or low.endswith(".png") or low.endswith(".jpg") or low.endswith(".jpeg"):
            items.append(f)
    return sorted(items, key=lambda x: x.lower())

def sips_dim(path):
    out = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", path],
                         capture_output=True, text=True).stdout
    w = h = 0
    for line in out.splitlines():
        if "pixelWidth" in line: w = int(line.split(":")[-1])
        if "pixelHeight" in line: h = int(line.split(":")[-1])
    return w, h

poster_files = list_posters()
print(f"found {len(poster_files)} poster files")
contact_doc = fitz.open()
contact_rows = []  # (slug, original) for labels
for f in poster_files:
    src = os.path.join(POSTERS_SRC, f)
    slug = slugify(f)
    full_out = os.path.join(ASSETS, "posters", "full", slug + ".jpg")
    thumb_out = os.path.join(ASSETS, "posters", "thumb", slug + ".jpg")
    low = f.lower()
    w = h = 0
    if low.endswith(".pdf"):
        try:
            doc = fitz.open(src)
            pixf = render_pdf_page(doc, 0, 1500, 82)
            save_jpg(pixf, full_out, 82)
            w, h = pixf.width, pixf.height
            pixt = render_pdf_page(doc, 0, 560, 72)
            save_jpg(pixt, thumb_out, 72)
            doc.close()
        except Exception as e:
            print("  ! pdf fail", f, e); continue
    else:
        # PNG/JPG -> resize via sips
        try:
            subprocess.run(["sips", "-Z", "1500", "-s", "format", "jpeg",
                            "-s", "formatOptions", "82", src, "--out", full_out],
                           check=True, capture_output=True)
            subprocess.run(["sips", "-Z", "560", "-s", "format", "jpeg",
                            "-s", "formatOptions", "72", src, "--out", thumb_out],
                           check=True, capture_output=True)
            w, h = sips_dim(full_out)
        except Exception as e:
            print("  ! img fail", f, e); continue
    manifest["posters"].append({"slug": slug, "original": f,
                                "full": f"assets/posters/full/{slug}.jpg",
                                "thumb": f"assets/posters/thumb/{slug}.jpg",
                                "w": w, "h": h})
    print(f"  poster {f} -> {slug} ({w}x{h})")

# poster contact sheet from generated thumbs
cols = 5
cell = 240; pad = 8
ps = manifest["posters"]
per = 20
for start in range(0, len(ps), per):
    chunk = ps[start:start+per]
    rows = (len(chunk)+cols-1)//cols
    pw = cols*cell + (cols+1)*pad
    ph = rows*(cell+26) + pad
    cpage = contact_doc.new_page(width=pw, height=ph)
    for k, item in enumerate(chunk):
        r, c = divmod(k, cols)
        x0 = pad + c*(cell+pad); y0 = pad + r*(cell+26)
        rect = fitz.Rect(x0, y0, x0+cell, y0+cell)
        try:
            img = fitz.open(os.path.join(OUT, item["thumb"]))
            r2 = img[0].rect
            sc = min(cell/r2.width, cell/r2.height)
            iw, ih = r2.width*sc, r2.height*sc
            drect = fitz.Rect(x0+(cell-iw)/2, y0+(cell-ih)/2, x0+(cell-iw)/2+iw, y0+(cell-ih)/2+ih)
            cpage.insert_image(drect, filename=os.path.join(OUT, item["thumb"]))
        except Exception as e:
            pass
        cpage.insert_text((x0+1, y0+cell+12), item["original"][:34], fontsize=7)
contact_doc.save(os.path.join(CONTACT, "posters.pdf"))
cdoc = fitz.open(os.path.join(CONTACT, "posters.pdf"))
for ci in range(len(cdoc)):
    pix = render_pdf_page(cdoc, ci, 1500, 80)
    save_jpg(pix, os.path.join(CONTACT, f"posters-sheet{ci+1}.jpg"), 80)

with open(os.path.join(OUT, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=2)
print("DONE. projects:", len(manifest["projects"]), "posters:", len(manifest["posters"]))
print("contact sheets in", CONTACT)

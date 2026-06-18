#!/usr/bin/env python3
"""Render ROMA (PDF) + The Humming Tree (social images) into web assets,
add ROMA to manifest.json, and write tht_groups.json for generate_data.py."""
import os, re, json, subprocess
import fitz

BASE = "/Users/paapatype/Desktop/GD4/Raka Flaka/Raka Website "
OUT = os.path.join(BASE, "Technical Website Data")
ASSETS = os.path.join(OUT, "assets")
DESIGN = os.path.join(BASE, "Design Projects_Raka")

def save_jpg(pix, path, q=82):
    try:
        open(path, "wb").write(pix.tobytes(output="jpg", jpg_quality=q))
    except Exception:
        tmp = path + ".png"; pix.save(tmp)
        subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", str(q), tmp, "--out", path],
                       check=True, capture_output=True); os.remove(tmp)

def render_pdf(doc, i, long_edge=1366, q=82):
    page = doc[i]; r = page.rect; z = long_edge / max(r.width, r.height)
    return page.get_pixmap(matrix=fitz.Matrix(z, z), alpha=False)

# ---------- ROMA ----------
roma_src = os.path.join(DESIGN, "ROMA BRAND BOOK for website.pdf")
roma_dir = os.path.join(ASSETS, "projects", "roma"); os.makedirs(roma_dir, exist_ok=True)
doc = fitz.open(roma_src)
roma_pages = []
for i in range(len(doc)):
    pix = render_pdf(doc, i, 1366, 82)
    fn = f"{i+1:02d}.jpg"
    save_jpg(pix, os.path.join(roma_dir, fn), 82)
    roma_pages.append({"src": f"assets/projects/roma/{fn}", "w": pix.width, "h": pix.height})
doc.close()
print(f"ROMA: {len(roma_pages)} slides")

# add ROMA to manifest.json (dedupe)
mpath = os.path.join(OUT, "manifest.json")
manifest = json.load(open(mpath))
manifest["projects"] = [p for p in manifest["projects"] if p["slug"] != "roma"]
manifest["projects"].append({"slug": "roma", "title": "Roma", "pageCount": len(roma_pages), "pages": roma_pages})
json.dump(manifest, open(mpath, "w"), indent=2)
print("manifest projects now:", [p["slug"] for p in manifest["projects"]])

# ---------- THE HUMMING TREE ----------
THT = os.path.join(DESIGN, "THE HUMMING TREE", "THT Social Media ")
tht_dir = os.path.join(ASSETS, "projects", "the-humming-tree"); os.makedirs(tht_dir, exist_ok=True)
groups_src = [
    ("FLF / Friends Like Family",
     "A monthly party series with Bangalore's favourite DJs and tastemakers. The identity is clever, concise and, of course, friendly - the initials FLF fold into a smiley.",
     ["FLF/FLF IG Post.png", "FLF/FLF Fushi.png", "FLF/FLF Insowmya.png", "FLF/FLF Riyad.png"]),
    ("Pitch Please",
     "THT's weekly karaoke night. A self-explanatory identity crafted straight from the brand font.",
     ["Pitch Please/Pitch Please IG Post.png", "Pitch Please/Pitch Please IG Story.png"]),
    ("Happy Hour",
     "The Happy Hour - drinks priced so low you'll check the bill twice. Identity and copy.",
     ["Happy Hours/THT HAPPY HRS 9.png", "Happy Hours/THT HAPPY HRS 9_2.png",
      "Happy Hours/THT HAPPY HRS 9_3.png", "Happy Hours/THT HAPPY HRS 9_4.png"]),
]
def slugify(s): return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")
def dims(p):
    out = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", p], capture_output=True, text=True).stdout
    w = h = 0
    for ln in out.splitlines():
        if "pixelWidth" in ln: w = int(ln.split(":")[-1])
        if "pixelHeight" in ln: h = int(ln.split(":")[-1])
    return w, h
tht_groups = []
for title, text, files in groups_src:
    imgs = []
    for f in files:
        src = os.path.join(THT, f)
        if not os.path.isfile(src): print("  ! missing", f); continue
        slug = slugify(os.path.splitext(os.path.basename(f))[0])
        dst = os.path.join(tht_dir, slug + ".jpg")
        subprocess.run(["sips", "-Z", "1200", "-s", "format", "jpeg", "-s", "formatOptions", "84", src, "--out", dst],
                       check=True, capture_output=True)
        w, h = dims(dst)
        imgs.append({"src": f"assets/projects/the-humming-tree/{slug}.jpg", "w": w, "h": h})
    tht_groups.append({"title": title, "text": text, "images": imgs})
    print(f"THT group '{title}': {len(imgs)} images")
json.dump({"groups": tht_groups}, open(os.path.join(OUT, "tht_groups.json"), "w"), indent=2)
print("wrote tht_groups.json")

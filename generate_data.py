#!/usr/bin/env python3
"""Merge hand-authored copy with the asset manifest -> js/data.js (a global object)."""
import os, json

OUT = os.path.dirname(os.path.abspath(__file__))
manifest = json.load(open(os.path.join(OUT, "manifest.json")))

PROJECT_META = {
    "saras-co": {
        "title": "Saras Co", "year": "2024",
        "role": "Brand identity & visual language",
        "descriptor": "A Bombay music & events company touring world-class live acts across India.",
        "intro": "When we set out to build Saras Co's identity, one thing mattered above all: a mark that is memorable, robust and built to last — one that scales and travels across any medium effortlessly. The answer drew on iconic 80s record-label iconography and a brutalist edge.",
    },
    "unboxing-blr": {
        "title": "Unboxing BLR", "year": "2024",
        "role": "Brand guidelines & identity system",
        "descriptor": "A participative, volunteer-driven project crafting a new brand narrative for Bangalore.",
        "intro": "Bangalore has quietly become a multifaceted global city, yet its story has never been told as well as it deserves. Unboxing BLR is a volunteer-driven effort to craft that narrative across many media — and this is the identity system that holds it all together.",
    },
    "roma": {
        "title": "Roma", "year": "2024",
        "role": "Brand identity & visual system",
        "descriptor": "An authentic, non-traditional Italian deli in Bangalore.",
        "intro": "ROMA Italian Deli — founded by Prathap and Chef Rajath — skips the usual pizzas and pastas for high-quality, globally imported ingredients. The identity had to feel just as authentic and unapologetic: a bold custom wordmark, a sun-and-tomato palette pulled straight from Italy, and a pattern language that runs from packaging to signage. Feeling Italian today?",
    },
}

PROJECT_CAPTIONS = {
    "saras-co": [
        "The core logo unit — a mark that reads at once as a tape reel, a disc, and the Gujarati hand-gesture for 'good.' In Gujarati, saras means something genuinely cool.",
        "The tagline in use: In Good Company. When the room is full of world-class touring artists and an audience that truly listens, you're in good company.",
        "The wordmark — drawn from the masthead of Gujarat Samachar and rebuilt letter by letter in English, custom-illustrated to sit between 80s record label and brutalist.",
        "The identity on apparel — the mark holds its punch from a tee to a tote.",
        "Merch carries the same robust mark across cream and black.",
        "Across posters and social the language stays consistent — timeless yet contemporary, vintage nostalgia tuned to today's musical landscape.",
        "The final wordmark: striking, scalable, and built to last.",
    ],
    "unboxing-blr": [
        "Brand guidelines for Unboxing BLR — a volunteer-driven project crafting a new narrative for Bangalore across many media.",
        "The purpose: hand the brand to every stakeholder, so the identity stays consistent wherever it appears.",
        "Vis-à-vis its past, Bangalore has grown into a multifaceted global city — a story that deserves to be articulated better. That's the brief.",
        "The logo.",
        "The wordmark reads as unboxingBLR — U caps, nboxing lower, BLR all caps — paired with the line The City of New Beginnings.",
        "The palette shifts to a vibrant red and yellow drawn from the state flag, tying the brand to the city; the heart returns to a single colour to stay legible when scaled down.",
        "Do: hold the identity against white or off-white, where it has strong contrast.",
        "Don't: drop it onto busy textures or low-contrast colour that kills the mark.",
        "Lockups for print, web and mobile — including a condensed heart-and-BLR mark and a co-brand lock-up with Bangalore International Centre.",
        "Typography: Titillium — tall, lightly rounded, structurally robust — as the primary face, set alongside Kannada for the city it speaks to.",
        "The heart becomes a system — icons for conversation, collaboration, foresight, heritage, technology and hospitality, and a pattern built from the unboxed heart.",
        "Two palettes: a primary that reads as the city's drive and optimism, and a secondary for its landscape, culture and tech.",
        "Imagery.",
        "Diverse, energetic, evergreen, effortlessly cool — the city in its own script.",
        "The city where the future is built. The city of now.",
        "The city of diverse cultures — heritage and everyday Bangalore, side by side.",
        "Great conversations. Even better ideas.",
        "True Southern hospitality. Like no other.",
        "The identity worn — apparel that lets people carry the city's story.",
        "Tote lock-ups in English and Kannada — compact and instantly recognisable.",
        "Logo behaviour for video — over imagery, at 20% opacity, in solid zaffre, and in black.",
        "♥BLR. Fin.",
    ],
    "roma": [
        "ROMA Italian Deli — a bold, custom wordmark for an Italian eatery that plays by its own rules.",
        "The tagline sets the tone — Feeling Italian Today? — an invitation, not a menu.",
        "An authentic, non-traditional deli from Prathap and Chef Rajath, built on globally sourced ingredients rather than the usual pizzas and pastas.",
        "The core wordmark and its 'R' sub-mark — a compact monogram for when the full lockup won't fit.",
        "A palette drawn from Italy itself — sun-baked orange, basil green, tomato red — grounded in the Colosseum and the Cinque Terre coast.",
        "The identity holds its warmth across every colour in the system.",
        "Bold, appetite-forward, unmistakably ROMA.",
        "Clear-space and construction rules keep the wordmark confident at any size.",
        "The same discipline applied to the 'R' mark.",
        "Co-brand lock-ups for partners and platforms.",
        "The mood — people, plates and the easy joy of eating well together.",
        "A pattern language built from the letterforms, for wraps, walls and everything between.",
        "Packaging that turns takeaway into part of the brand.",
        "Carry-bags that look as good leaving as the food tastes.",
        "The pattern at full tilt across butcher paper and wraps.",
        "Type system — Unbounded for the display voice, Work Sans for everything that stays quiet and clear.",
        "The identity on social — consistent, hungry, scroll-stopping.",
        "Worn by the team — chef's apron and staff tee.",
        "Merch with a wink: Mamma mia!",
        "Signage in English and Kannada — ROMA, at home in Bangalore.",
        "Stationery that carries the system down to the smallest detail.",
        "Where it all leads — the food, framed by the brand.",
        "Fine. — Italian for 'the end.'",
    ],
}

# slug -> [title, caption(None if no copy)]
POSTERS = {
    "joe-armon-jones-tour-png": ["Joe Armon Jones", "Bringing Joe Armon Jones to India for the first time, presented by Saras — Bangalore and Mumbai."],
    "jaj-main-tour-print": ["Joe Armon Jones", "The main tour print for Joe Armon Jones' first India run with Saras."],
    "akbars-court-a4": ["Akbar's Court", "An event series by Mumbai's Nrtya — a quirky, contemporary take on Mughal-court art, with Arteramesh, Tansane, Nigel, Rajaratnam and Capricio."],
    "di-web-flyer": ["Dualist Inquiry", "Delhi's Dualist Inquiry guards his privacy, so the brief was to never show his face directly — only manipulate it with texture. Which is exactly what happened."],
    "kahn-a4": ["Kahn", "With Krunk, for their 8th anniversary — Kahn from the UK and his deep, grimy, thunderous dubstep. 18–20 May 2017."],
    "teklife-tour-bangalore": ["Teklife", "DJs from the Teklife crew — originators of footwork, a genre that has gone global from the US and UK to Southeast Asia, Australia and Japan. Bangalore."],
    "ripple-2x3f": ["Ripple", "Oceantied's club-night series, Ripple — inspired by early-2000s UK rave flyers crossed with science fiction."],
    "loefah-a4": ["Loefah", "Loefah's India tour as part of Bassick Sense, with Oceantied on support."],
    "bassick-sense-del-vol-11-flyer": ["Bassick Sense Vol. 11", "Bassick Sense, an IP I co-created with Social in 2016 — a rootsy, contemporary look held across the whole series. Delhi."],
    "bombay-bandstand-print-2x3": ["Bombay Bandstand", "For Social's Bombay Bandstand — an IP built around live musicians and live music."],
    "malfnktion-a3": ["Malfnktion", "Malfnktion, framed by the analog and MIDI gear he surrounds himself with."],
    "oceantied-a3-print": ["Oceantied — Euro Tour", "Oceantied's European tour — Prague, Malta, Finland, Croatia — plus festivals like Outlook and Dimensions."],
    "su-real-niki-web-flyer": ["Su Real × Niki", "The very first poster with Krunk — Delhi's Su Real featuring Niki, at Bonobo, Bombay. Minimal type over the artist's portrait."],
    "taaq-1": ["Thermal And A Quarter", "Thermal And A Quarter, hosted by The Humming Tree. The name hides a pun few catch — three malus and a quarter malo; the band began as four."],
    "barely-legal-tour-web-flyer-delhi": ["Barely Legal", "For Chloe Robinson (formerly Barely Legal) — the Delhi date of the India tour."],
    "aj-saras-poster": ["Alicia Joy × Saras", "A tour poster for Alicia Joy's India run with Krunk and Saras — Delhi, Mumbai, Kolkata and Goa. 2025."],
    "mocity-tbone-stakez-web-flyer": ["MoCity × T-Bone Stakez", "Two gun-fingers and directional arrows. Fri 6 Jan, 10pm, Mumbai."],
    "spaven-tour-2-main": ["Richard Spaven", "Richard Spaven's second India tour — Mumbai, Dubai and Goa. Built from a cinematic montage of on-stage portraits."],
    "ez-riser-oceantied-a4-web-flyer": ["EZ Riser × Oceantied", "With Krunk — bringing the contemporary poster language of UK and European electronic events to the Indian scene."],
    "ez-riser-tansane-web-flyer": ["EZ Riser × Tansane", "With Krunk — EZ Riser and Tansane, Mumbai."],
    "oceantied-euro-tour-2-pdf-a4": ["Oceantied — Euro Tour", "Oceantied across Europe — the second run."],
    "raji-rags-print": ["Raji Rags", "A Boiler Room / NTS Radio name at Bangalore Social — 12 Jan 2017."],
    "sputnik-a3-print": ["Sputnik", "A personal experiment — not a gig poster — a play on the elements of nature, like the wind."],
    "saras-spaven-3-2": ["Saras × Spaven", None],
    "oceantied-ez-riser-malta-web-flyer": ["Oceantied × EZ Riser — Malta", None],
    "oceantied-x-ez-a4": ["Oceantied × EZ Riser", None],
    "ox7gen-ezriser": ["Ox7gen × EZ Riser", None],
    "saras-curations-story": ["Saras Curations", None],
    "saras-curations-unit-red": ["Saras Curations", None],
    "bliss": ["Bliss", None],
    "blot-zokhuma-web-flyer": ["Blot × Zokhuma", None],
    "goth-trad-a4": ["Goth-Trad", None],
    "iseo-dodosound-flyer": ["Iseo & Dodosound", None],
    "pxo-web-flyer": ["PxO", None],
    "ra-flyer": ["RA", None],
    "sphaira-a3-print": ["Sphaira", None],
    "tamypro-dansun-web-flyer-2": ["Tamypro × DanSun", None],
    "spaven-tour-2-main_dup": ["", None],  # guard, ignored
}

POSTER_ORDER = [
    "joe-armon-jones-tour-png", "akbars-court-a4", "di-web-flyer", "kahn-a4",
    "teklife-tour-bangalore", "ripple-2x3f", "loefah-a4", "bassick-sense-del-vol-11-flyer",
    "malfnktion-a3", "oceantied-a3-print", "su-real-niki-web-flyer", "taaq-1",
    "bombay-bandstand-print-2x3", "barely-legal-tour-web-flyer-delhi", "aj-saras-poster",
    "jaj-main-tour-print", "spaven-tour-2-main", "mocity-tbone-stakez-web-flyer",
    "ez-riser-oceantied-a4-web-flyer", "raji-rags-print",
]

# ---- build projects ----
projects = []
for proj in manifest["projects"]:
    slug = proj["slug"]
    meta = PROJECT_META[slug]
    caps = PROJECT_CAPTIONS[slug]
    slides = []
    for i, pg in enumerate(proj["pages"]):
        slides.append({"src": pg["src"], "w": pg["w"], "h": pg["h"],
                       "caption": caps[i] if i < len(caps) else ""})
    projects.append({"slug": slug, "title": meta["title"], "year": meta["year"],
                     "role": meta["role"], "descriptor": meta["descriptor"],
                     "intro": meta["intro"], "slides": slides})

# ---- The Humming Tree (grouped project; social images, not a PDF) ----
tht_path = os.path.join(OUT, "tht_groups.json")
if os.path.exists(tht_path):
    tht = json.load(open(tht_path))
    tht_slides = []
    for g in tht["groups"]:
        tht_slides.append({"type": "section", "title": g["title"], "text": g["text"]})
        for im in g["images"]:
            tht_slides.append({"src": im["src"], "w": im["w"], "h": im["h"], "caption": ""})
    projects.append({
        "slug": "the-humming-tree", "title": "The Humming Tree", "year": "2023",
        "role": "Event identities & campaign design",
        "descriptor": "Event identities for one of Bangalore's favourite music venues.",
        "intro": "The Humming Tree is a Bangalore institution — so its nights needed identities with as much personality as the room. A family of sub-brands, each clever, concise and unmistakably THT.",
        "kind": "grouped", "slides": tht_slides,
    })

# ---- build posters (curated order, rest appended) ----
by_slug = {p["slug"]: p for p in manifest["posters"]}
ordered = [s for s in POSTER_ORDER if s in by_slug]
ordered += [s for s in by_slug if s not in ordered]
posters = []
for slug in ordered:
    p = by_slug[slug]
    title, caption = POSTERS.get(slug, [slug.replace("-", " ").title(), None])
    posters.append({"slug": slug, "title": title, "caption": caption,
                    "thumb": p["thumb"], "full": p["full"], "w": p["w"], "h": p["h"]})

data = {"projects": projects, "posters": posters}
js = "/* Auto-generated by generate_data.py — do not edit by hand. */\n"
js += "window.RAKA_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
os.makedirs(os.path.join(OUT, "js"), exist_ok=True)
open(os.path.join(OUT, "js", "data.js"), "w").write(js)
print(f"wrote js/data.js — {len(projects)} projects, {len(posters)} posters")

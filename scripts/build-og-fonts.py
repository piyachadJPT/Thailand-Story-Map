"""
Builds the Kanit copies used only by Open Graph images (src/lib/seo/og.tsx).

Satori (next/og) mis-applies Kanit's contextual Thai substitutions, so some
tone marks vanish (เรื่อง → เรือง) or collide with upper vowels. Kanit already
draws the right shapes as separate glyphs (.small = raised above an upper
vowel, .narrow = shifted left for ป ฝ ฟ ฬ, .less/.short = consonants without a
tail). This script removes GSUB, maps those glyphs to private-use code points
(see OG_PUA in og-thai.ts), and renames the family to "Kanit OG".

One-off tool. Run from the repo root with fontTools installed:
  python3 -m pip install fonttools
  python3 scripts/build-og-fonts.py
"""
from fontTools.ttLib import TTFont

FONTS_DIR = "src/assets/fonts"
# private-use code point → glyph name; keep in sync with src/lib/seo/og-thai.ts
PUA = {}
for low in (0x48, 0x49, 0x4A, 0x4B, 0x4C):
    PUA[0xF700 + low] = f"uni0E{low:02X}.small"
    PUA[0xF800 + low] = f"uni0E{low:02X}.narrow"
for low in (0x31, 0x34, 0x35, 0x36, 0x37, 0x47, 0x4D):
    PUA[0xF800 + low] = f"uni0E{low:02X}.narrow"
for low in (0x38, 0x39, 0x3A):
    PUA[0xF700 + low] = f"uni0E{low:02X}.small"
PUA[0xF70D] = "uni0E0D.less"
PUA[0xF710] = "uni0E10.less"
PUA[0xF70E] = "uni0E0E.short"
PUA[0xF70F] = "uni0E0F.short"

for weight in ("Medium", "SemiBold"):
    font = TTFont(f"{FONTS_DIR}/Kanit-{weight}.ttf")
    glyphs = set(font.getGlyphOrder())
    missing = [name for name in PUA.values() if name not in glyphs]
    if missing:
        raise SystemExit(f"Kanit-{weight}: missing glyphs {missing}")
    for table in font["cmap"].tables:
        if table.isUnicode():
            table.cmap.update(PUA)
    del font["GSUB"]
    if "DSIG" in font:
        del font["DSIG"]
    for record in font["name"].names:
        if record.nameID in (1, 16):
            record.string = "Kanit OG"
        elif record.nameID == 4:
            record.string = f"Kanit OG {weight}"
        elif record.nameID == 6:
            record.string = f"KanitOG-{weight}"
    out = f"{FONTS_DIR}/KanitOG-{weight}.ttf"
    font.save(out)
    print("wrote", out)

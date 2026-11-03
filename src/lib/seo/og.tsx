import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { shapeThaiForOg } from "./og-thai";
import { truncateThai, withThaiBreaks } from "./text";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** Brand colors as hex: CSS variables do not exist inside OG images. */
const CREAM = "#f6f3ec";
const INK = "#12161f";
const GOLD = "#c8963e";
const GOLD_INK = "#85601f";
const MUTED = "#6b6f78";

const root = process.cwd();

let fontsPromise: Promise<{ name: string; data: Buffer; weight: 500 | 600; style: "normal" }[]> | null =
  null;

/**
 * Kanit (OFL) from src/assets/fonts — never fetched from Google at runtime.
 * The "KanitOG" copies carry pre-positioned Thai marks (scripts/build-og-fonts.py).
 */
function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(root, "src/assets/fonts/KanitOG-Medium.ttf")),
    readFile(join(root, "src/assets/fonts/KanitOG-SemiBold.ttf")),
  ]).then(([medium, semibold]) => [
    { name: "Kanit", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Kanit", data: semibold, weight: 600 as const, style: "normal" as const },
  ]);
  return fontsPromise;
}

let logoPromise: Promise<string> | null = null;

function loadLogo() {
  logoPromise ??= readFile(join(root, "src/app/icon.png")).then(
    (data) => `data:image/png;base64,${data.toString("base64")}`
  );
  return logoPromise;
}

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

/**
 * Cover image as a data URI, or null when it cannot be used (network error,
 * timeout, unsupported format, too large). The OG image then uses the pattern.
 */
export async function loadCoverImage(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    const type = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!IMAGE_TYPES.includes(type)) return null;
    const data = Buffer.from(await response.arrayBuffer());
    if (data.byteLength > 8 * 1024 * 1024) return null;
    return `data:${type};base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Thai text ready for Satori: word breaks for wrapping, marks pre-positioned. */
function t(text: string) {
  return shapeThaiForOg(withThaiBreaks(text));
}

/** Faint map texture: contour lines, a few roads and pins. */
function MapPattern({ color, opacity }: { color: string; opacity: number }) {
  return (
    <svg
      width="1200"
      height="630"
      viewBox="0 0 1200 630"
      style={{ position: "absolute", top: 0, left: 0, opacity }}
    >
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path
          key={i}
          d={`M -40 ${90 + i * 80} C 220 ${30 + i * 80}, 380 ${170 + i * 80}, 620 ${100 + i * 80} S 1020 ${40 + i * 80}, 1260 ${120 + i * 80}`}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      ))}
      <path d="M 120 630 L 420 330 L 760 380 L 1200 60" fill="none" stroke={color} strokeWidth="5" strokeDasharray="14 12" />
      {[
        [300, 220],
        [860, 300],
        [1020, 140],
        [520, 470],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="9" fill={color} />
      ))}
    </svg>
  );
}

/** Map pin drawn as SVG (emoji do not render reliably in OG images). */
function PinIcon({ color, size = 30 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 2C7.6 2 4 5.5 4 9.9c0 5.6 6.9 11.4 7.2 11.7.5.4 1.1.4 1.6 0 .3-.3 7.2-6.1 7.2-11.7C20 5.5 16.4 2 12 2zm0 10.6a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6z"
        fill={color}
      />
    </svg>
  );
}

function Frame({ children, background }: { children: React.ReactNode; background: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background,
        fontFamily: "Kanit",
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          right: 24,
          bottom: 24,
          border: `2px solid ${GOLD}`,
          borderRadius: 28,
          opacity: 0.55,
          display: "flex",
        }}
      />
    </div>
  );
}

/**
 * Site / category / province card: cream background, map texture, logo,
 * heading and subtitle. `count` adds "N เรื่อง".
 */
export async function brandImage(opts: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  count?: number;
  accent?: string;
}) {
  const [fonts, logo] = await Promise.all([loadFonts(), loadLogo()]);
  const accent = opts.accent ?? GOLD;
  return new ImageResponse(
    (
      <Frame background={CREAM}>
        <MapPattern color={GOLD_INK} opacity={0.12} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 88px",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={logo} width={88} height={88} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 30, fontWeight: 600, color: INK }}>{siteConfig.name}</span>
              <span style={{ fontSize: 24, fontWeight: 500, color: GOLD_INK }}>{t(siteConfig.tagline)}</span>
            </div>
          </div>
          <div style={{ display: "flex", width: 120, height: 6, background: accent, borderRadius: 3, marginTop: 44 }} />
          {opts.eyebrow ? (
            <span style={{ fontSize: 30, fontWeight: 500, color: GOLD_INK, marginTop: 28 }}>
              {t(opts.eyebrow)}
            </span>
          ) : null}
          <span
            style={{
              fontSize: 76,
              fontWeight: 600,
              color: INK,
              lineHeight: 1.35,
              marginTop: opts.eyebrow ? 6 : 28,
              maxWidth: 1000,
            }}
          >
            {t(truncateThai(opts.title, 48))}
          </span>
          <span style={{ fontSize: 32, fontWeight: 500, color: MUTED, lineHeight: 1.5, marginTop: 18, maxWidth: 980 }}>
            {t(truncateThai(opts.subtitle, 90))}
          </span>
          {opts.count !== undefined ? (
            <span style={{ fontSize: 30, fontWeight: 600, color: accent, marginTop: 24 }}>
              {t(`${opts.count.toLocaleString("th-TH")} เรื่องเล่า`)}
            </span>
          ) : null}
        </div>
      </Frame>
    ),
    { ...OG_SIZE, fonts }
  );
}

/** Story card: cover photo (or texture), dark fade, category chip, title, province. */
export async function storyImage(opts: {
  title: string;
  categoryName: string;
  categoryColor: string;
  provinceName: string;
  coverUrl?: string | null;
}) {
  const [fonts, logo, cover] = await Promise.all([loadFonts(), loadLogo(), loadCoverImage(opts.coverUrl)]);
  // ~3 lines at 64px over 1030px; the word cut keeps vowels with their consonant.
  const title = truncateThai(opts.title, 66);
  return new ImageResponse(
    (
      <Frame background={INK}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={cover}
            width={1200}
            height={630}
            style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
          />
        ) : (
          <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 1200,
                height: 630,
                display: "flex",
                background: `radial-gradient(circle at 80% 20%, ${opts.categoryColor}66, ${INK} 70%)`,
              }}
            />
            <MapPattern color={opts.categoryColor} opacity={0.35} />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background: "linear-gradient(180deg, rgba(14,17,23,0.15) 0%, rgba(14,17,23,0.55) 45%, rgba(14,17,23,0.94) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 56,
            right: 64,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "10px 22px 10px 10px",
            borderRadius: 999,
            background: "rgba(246,243,236,0.92)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={logo} width={52} height={52} />
          <span style={{ fontSize: 24, fontWeight: 600, color: INK }}>{siteConfig.name}</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: 72,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex" }}>
            <span
              style={{
                fontSize: 26,
                fontWeight: 600,
                color: "#ffffff",
                background: opts.categoryColor,
                padding: "6px 22px 10px",
                borderRadius: 999,
              }}
            >
              {t(opts.categoryName)}
            </span>
          </div>
          <span
            style={{
              fontSize: 64,
              fontWeight: 600,
              color: "#ffffff",
              lineHeight: 1.4,
              marginTop: 22,
              maxWidth: 1040,
            }}
          >
            {t(title)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
            <PinIcon color={GOLD} />
            <span style={{ fontSize: 32, fontWeight: 500, color: "#e6e3dc" }}>{t(opts.provinceName)}</span>
          </div>
        </div>
      </Frame>
    ),
    { ...OG_SIZE, fonts }
  );
}

import styles from "@/app/story/[province]/[slug]/story.module.css";

/** Decorative street map; independent of map services and story coordinates. */
export default function StoryMapBackground() {
  return (
    <div className={styles.mapBackdrop} aria-hidden="true" inert>
      <svg
        className={styles.mapBackdropCanvas}
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern
            id="story-city-blocks"
            width="230"
            height="190"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-18)"
          >
            <g fill="currentColor" opacity=".06">
              <rect x="16" y="16" width="78" height="57" rx="8" />
              <rect x="112" y="16" width="100" height="57" rx="8" />
              <rect x="16" y="94" width="130" height="77" rx="8" />
              <rect x="164" y="94" width="48" height="77" rx="8" />
            </g>
            <g stroke="currentColor" opacity=".18" strokeWidth="2">
              <path d="M0 0H230 M0 84H230 M0 190H230 M0 0V190 M104 0V84 M155 84V190 M230 0V190" />
            </g>
          </pattern>
        </defs>
        <rect width="1600" height="1000" fill="url(#story-city-blocks)" />
        <g stroke="currentColor" opacity=".12" strokeWidth="2">
          <path d="M-80 180Q140 -60 370 90T800 80T1300 90T1720 0 M-80 210Q140 -30 370 120T800 110T1300 120T1720 30 M-80 240Q140 0 370 150T800 140T1300 150T1720 60" />
          <path d="M-100 750Q150 560 330 710T800 700T1250 760T1700 620 M-100 780Q150 590 330 740T800 730T1250 790T1700 650 M-100 810Q150 620 330 770T800 760T1250 820T1700 680" />
        </g>
        <path
          d="M1120 -100C850 130 1280 280 1050 450S850 690 1110 840S1140 1060 950 1120"
          stroke="currentColor"
          strokeWidth="54"
          opacity=".08"
        />
        <path
          d="M1120 -100C850 130 1280 280 1050 450S850 690 1110 840S1140 1060 950 1120"
          stroke="currentColor"
          strokeWidth="2"
          opacity=".16"
        />
        <g
          stroke="currentColor"
          strokeWidth="9"
          opacity=".19"
          strokeLinecap="round"
        >
          <path d="M-100 430L300 300L580 350L850 220L1700 420" />
          <path d="M220 -100L340 220L260 520L490 1100" />
          <path d="M-100 950L470 650L790 630L1700 810" />
          <path d="M1450 -100L1270 260L1320 560L1510 1100" />
        </g>
        <g fill="currentColor" opacity=".22">
          <circle cx="300" cy="300" r="9" />
          <circle cx="470" cy="650" r="9" />
          <circle cx="1320" cy="560" r="9" />
        </g>
      </svg>
      <div className={styles.mapBackdropVeil} />
    </div>
  );
}

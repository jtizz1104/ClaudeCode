import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../Showcase/theme";
import logo from "./logo.png";
import logoMark from "./logo-mark.png";
import { useCopy, useLang } from "./lang";
import {
  Bg,
  Bi,
  Cut,
  Flag,
  Mark,
  Pill,
  Rise,
  SAFE,
  WIDTH,
  cream,
  usePop,
  useSmooth,
} from "./kit";

// ------------------------------------------------------------------ hook ---
const HookLine: React.FC<{
  text: string;
  delay: number;
  max: number;
  mark?: boolean;
  color?: string;
}> = ({ text, delay, max, mark, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.6 },
  });
  const lang = useLang();
  const size = Math.min(
    max,
    WIDTH / (text.length * (lang === "en" ? 0.7 : 0.6)),
  );
  return (
    <div
      style={{
        fontFamily: fonts.head,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.02,
        color,
        transform: `scale(${interpolate(s, [0, 1], [1.9, 1])})`,
        opacity: Math.min(1, s * 3),
        transformOrigin: "left center",
        whiteSpace: "nowrap",
        marginBottom: 6,
      }}
    >
      {mark ? <Mark>{text}</Mark> : text}
    </div>
  );
};

export const Hook: React.FC = () => {
  const c = useCopy();
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 5], [1, 0], {
    extrapolateRight: "clamp",
  });
  const shake = Math.max(0, 1 - frame / 12);
  const sx = Math.sin(frame * 5.3) * 16 * shake;
  const sy = Math.cos(frame * 6.1) * 12 * shake;
  const es = useSmooth(58);
  const tag = usePop(72);
  return (
    <AbsoluteFill>
      <Bg image="img/hero-paraguay.jpg" opacity={0.5} blur={14} />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: WIDTH,
          top: SAFE.top,
          bottom: SAFE.bottom,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transform: `translate(${sx}px, ${sy}px)`,
        }}
      >
        <div style={{ marginBottom: 40 }}>
          <Pill delay={6} font={fonts.body} color={colors.dark950}>
            <Flag /> {c.hookPill}
          </Pill>
        </div>
        {c.hook.map((h, i) => (
          <HookLine
            key={h.t}
            text={h.t}
            delay={4 + i * 10}
            max={h.kind ? 176 : 132}
            mark={h.kind === "mark"}
            color={h.kind === "cream" ? cream : undefined}
          />
        ))}
        {c.hookEs ? (
          <div
            style={{
              marginTop: 40,
              fontFamily: fonts.body,
              fontWeight: 500,
              fontSize: 48,
              color: colors.accentLight,
              opacity: es,
              transform: `translateY(${interpolate(es, [0, 1], [24, 0])}px)`,
            }}
          >
            {c.hookEs}
          </div>
        ) : null}
        <div
          style={{
            marginTop: 56,
            transform: `scale(${interpolate(tag, [0, 1], [0.5, 1])})`,
            transformOrigin: "left center",
            opacity: Math.min(1, tag * 2),
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: cream,
              color: colors.dark900,
              fontFamily: fonts.head,
              fontWeight: 700,
              fontSize: 40,
              padding: "14px 30px",
              borderRadius: 16,
            }}
          >
            {c.hookTag}
          </div>
        </div>
      </div>
      <AbsoluteFill
        style={{ background: "#fff", opacity: flash, zIndex: 70 }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- bridge ---
export const Bridge: React.FC = () => {
  const c = useCopy();
  const frame = useCurrentFrame();
  const bg = interpolate(frame, [0, 60], [0, 1]);
  return (
    <AbsoluteFill>
      <Bg />
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at 50% 50%, ${colors.brand}${Math.round(40 + bg * 80).toString(16)}, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: WIDTH,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <Rise delay={4}>
          <div
            style={{
              fontFamily: fonts.head,
              fontWeight: 600,
              fontSize: 52,
              color: colors.accentLight,
              letterSpacing: 3,
            }}
          >
            {c.bridgeKicker}
          </div>
        </Rise>
        <Bi
          pt={
            <>
              {c.bridge.pre}
              <Mark>{c.bridge.mark}</Mark>
              {c.bridge.post}
            </>
          }
          es={c.bridgeEs}
          size={92}
          esSize={36}
          delay={12}
        />
      </div>
      <Cut />
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------- why us ---
export const Why: React.FC = () => {
  const c = useCopy();
  const frame = useCurrentFrame();
  const n = c.countUp
    ? Math.round(
        interpolate(frame, [8, 50], [0, c.yearsNum], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        }),
      )
    : c.yearsNum;
  const big = usePop(6);
  const photo = usePop(40);
  const lines = c.motto;
  return (
    <AbsoluteFill>
      <Bg image="img/wtc-asuncion.jpg" opacity={0.28} blur={8} />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: WIDTH,
          top: SAFE.top,
          bottom: SAFE.bottom,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 22,
        }}
      >
        <Pill delay={2}>{c.whyPill}</Pill>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div
            style={{
              fontFamily: fonts.head,
              fontWeight: 700,
              fontSize: 270,
              lineHeight: 0.95,
              color: cream,
              transform: `scale(${interpolate(big, [0, 1], [0.6, 1])})`,
              transformOrigin: "left center",
              textShadow: `0 0 60px ${colors.accent}88`,
            }}
          >
            +{n}
          </div>
          <div>
            <div
              style={{
                fontFamily: fonts.head,
                fontWeight: 700,
                fontSize: 54,
                lineHeight: 1.05,
                color: "#fff",
              }}
            >
              {c.years[0]}
              <br />
              {c.years[1]}
            </div>
            {c.yearsEs ? (
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 30,
                  color: colors.accentLight,
                  marginTop: 8,
                }}
              >
                {c.yearsEs}
              </div>
            ) : null}
          </div>
        </div>
        {c.service ? (
          <Rise delay={26}>
            <div
              style={{
                fontFamily: fonts.head,
                fontWeight: 600,
                fontSize: 44,
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              {c.service[0]}
              {c.service[1] ? (
                <div
                  style={{
                    fontFamily: fonts.body,
                    fontWeight: 500,
                    fontSize: 30,
                    lineHeight: 1.3,
                    color: colors.accentLight,
                    marginTop: 12,
                  }}
                >
                  {c.service[1]}
                </div>
              ) : null}
            </div>
          </Rise>
        ) : null}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            opacity: photo,
            transform: `translateY(${interpolate(photo, [0, 1], [30, 0])}px)`,
          }}
        >
          <Img
            src={staticFile("img/gloria-sosa.jpg")}
            style={{
              width: 190,
              height: 190,
              borderRadius: 95,
              objectFit: "cover",
              objectPosition: "50% 20%",
              border: `5px solid ${colors.accent}`,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: fonts.head,
                fontWeight: 700,
                fontSize: 44,
                color: "#fff",
              }}
            >
              Gloria Sosa
            </div>
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: 28,
                color: colors.accentLight,
              }}
            >
              {c.role[1] ? `${c.role[0]} · ${c.role[1]}` : c.role[0]}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            marginTop: 6,
          }}
        >
          {lines.map(([pt, es], i) => (
            <Rise key={pt} delay={70 + i * 14} from={30}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 20,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: 18,
                  padding: "10px 26px",
                }}
              >
                <div
                  style={{
                    fontFamily: fonts.head,
                    fontWeight: 700,
                    fontSize: 64,
                    color: "#fff",
                  }}
                >
                  {pt}
                </div>
                {es ? (
                  <div
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 28,
                      color: colors.accentLight,
                    }}
                  >
                    {es}
                  </div>
                ) : null}
              </div>
            </Rise>
          ))}
        </div>
      </div>
      <Cut />
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- reviews ---
type Review = { name: string; from?: string; text: string; es?: string };
const Star: React.FC<{ delay: number; size: number }> = ({ delay, size }) => {
  const s = usePop(delay);
  return (
    <div
      style={{
        fontSize: size,
        color: "#fbbf24",
        lineHeight: 1,
        transform: `scale(${s})`,
      }}
    >
      ★
    </div>
  );
};

const Stars: React.FC<{ delay?: number; size?: number }> = ({
  delay = 0,
  size = 46,
}) => (
  <div style={{ display: "flex", gap: 6 }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <Star key={i} delay={delay + i * 3} size={size} />
    ))}
  </div>
);

const ReviewCard: React.FC<{ r: Review }> = ({ r }) => {
  const s = usePop(2);
  const { showStars, reviews } = useCopy();
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [90, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const out = reviews.length > 1 ? fade : 1;
  return (
    <div
      style={{
        background: "#fff",
        width: "100%",
        boxSizing: "border-box",
        borderRadius: 34,
        padding: "50px 50px 46px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        transform: `translateX(${interpolate(s, [0, 1], [420, 0]) - (1 - out) * 420}px) rotate(${interpolate(s, [0, 1], [4, 0])}deg)`,
        opacity: Math.min(1, s * 2) * out,
      }}
    >
      <div
        style={{
          fontFamily: fonts.head,
          fontWeight: 700,
          fontSize: 130,
          lineHeight: 0.6,
          color: colors.accent,
          height: 60,
        }}
      >
        “
      </div>
      <div
        style={{
          fontFamily: fonts.head,
          fontWeight: 600,
          fontSize: 68,
          lineHeight: 1.12,
          color: colors.dark900,
        }}
      >
        {r.text}
      </div>
      {r.es ? (
        <div
          style={{
            fontFamily: fonts.body,
            fontStyle: "italic",
            fontSize: 34,
            lineHeight: 1.3,
            color: "#64748b",
            marginTop: 18,
          }}
        >
          {r.es}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 30,
        }}
      >
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            background: colors.brand,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: fonts.head,
            fontWeight: 700,
            fontSize: 34,
          }}
        >
          {r.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: fonts.head,
              fontWeight: 700,
              fontSize: 36,
              color: colors.dark900,
            }}
          >
            {r.name}
          </div>
          {r.from ? (
            <div
              style={{ fontFamily: fonts.body, fontSize: 26, color: "#64748b" }}
            >
              {r.from}
            </div>
          ) : null}
        </div>
        {showStars ? <Stars delay={10} size={36} /> : null}
      </div>
    </div>
  );
};

export const Reviews: React.FC = () => {
  const c = useCopy();
  return (
    <AbsoluteFill>
      <Bg />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: WIDTH,
          top: SAFE.top - 10,
          bottom: SAFE.bottom,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <Pill delay={2}>{c.reviewsPill}</Pill>
        {c.showRating ? (
          <Rise delay={6}>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <div
                style={{
                  fontFamily: fonts.head,
                  fontWeight: 700,
                  fontSize: 190,
                  lineHeight: 0.9,
                  color: "#fff",
                }}
              >
                {c.rating}
              </div>
              <div>
                <Stars delay={12} size={56} />
                <div
                  style={{
                    fontFamily: fonts.head,
                    fontWeight: 600,
                    fontSize: 44,
                    color: "#fff",
                    marginTop: 8,
                  }}
                >
                  {c.count[0]}
                </div>
                {c.count[1] ? (
                  <div
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 28,
                      color: colors.accentLight,
                    }}
                  >
                    {c.count[1]}
                  </div>
                ) : null}
              </div>
            </div>
          </Rise>
        ) : null}
        <div style={{ position: "relative", flex: 1 }}>
          {c.reviews.map((r, i) => (
            <Sequence
              key={r.name}
              from={i * 100}
              durationInFrames={c.reviews.length > 1 ? 100 : 9999}
              layout="none"
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ReviewCard r={r} />
              </div>
            </Sequence>
          ))}
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 28,
            lineHeight: 1.3,
            color: "rgba(255,255,255,0.78)",
          }}
        >
          {c.reviewsNote}
        </div>
      </div>
      <Cut />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------- cta ---
export const Cta: React.FC = () => {
  const c = useCopy();
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 5) * 0.025;
  const end = interpolate(frame, [c.endAt, c.endAt + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const card = useSmooth(c.endAt + 6);
  return (
    <AbsoluteFill>
      <Bg image="img/hero-paraguay.jpg" opacity={0.3} blur={12} />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: WIDTH,
          top: SAFE.top,
          bottom: SAFE.bottom,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 34,
        }}
      >
        <Pill delay={2}>{c.ctaPill}</Pill>
        <Bi
          pt={
            <>
              {c.cta.pre}
              <Mark>{c.cta.mark}</Mark>
            </>
          }
          es={c.ctaEs}
          size={102}
          esSize={36}
          delay={6}
        />
        <Rise delay={30}>
          <div
            style={{
              transform: `scale(${pulse})`,
              transformOrigin: "left center",
              display: "inline-block",
              background: cream,
              color: colors.dark900,
              borderRadius: 22,
              padding: "20px 38px",
              maxWidth: WIDTH,
              boxShadow: "0 18px 50px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontFamily: fonts.head,
                fontWeight: 700,
                fontSize: c.button.length > 30 ? 48 : 56,
                lineHeight: 1.1,
              }}
            >
              {c.button}
            </div>
            {c.buttonSub ? (
              <div
                style={{
                  fontFamily: fonts.body,
                  fontWeight: 500,
                  fontSize: 30,
                }}
              >
                {c.buttonSub}
              </div>
            ) : null}
          </div>
        </Rise>
        <Rise delay={40}>
          <div
            style={{
              fontFamily: fonts.head,
              fontWeight: 700,
              fontSize: 60,
              color: "#fff",
            }}
          >
            WhatsApp +595 981 504 861
          </div>
          <div
            style={{
              fontFamily: fonts.body,
              fontWeight: 500,
              fontSize: 38,
              color: colors.accentLight,
              marginTop: 6,
            }}
          >
            {c.url}
          </div>
        </Rise>
      </div>
      <Cut />
      {c.endCard ? (
        <AbsoluteFill
          style={{
            background: "#fff",
            opacity: end,
            zIndex: 80,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 40,
          }}
        >
          <Img
            src={c.endTagline ? logoMark : logo}
            style={{
              width: 900,
              opacity: card,
              transform: `scale(${interpolate(card, [0, 1], [0.9, 1])})`,
            }}
          />
          {c.endTagline ? (
            <div
              style={{
                fontFamily: fonts.body,
                fontWeight: 500,
                fontSize: 34,
                color: colors.brand,
                opacity: card,
                marginTop: -20,
              }}
            >
              {c.endTagline}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: fonts.head,
              fontWeight: 600,
              fontSize: 40,
              color: colors.brand,
              opacity: card,
            }}
          >
            {c.url} · WhatsApp +595 981 504 861
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

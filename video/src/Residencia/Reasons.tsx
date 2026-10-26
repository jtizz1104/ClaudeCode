import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { colors, fonts } from "../Showcase/theme";
import {
  Bg,
  Bi,
  Cut,
  Mark,
  Photo,
  Pill,
  Rise,
  SAFE,
  WIDTH,
  cream,
  usePop,
  useSmooth,
} from "./kit";
import { useCopy } from "./lang";

// ---------------------------------------------------------------- layout ---
export const Reason: React.FC<{
  n: number;
  pt: React.ReactNode;
  es?: string;
  subPt: string;
  subEs?: string;
  visual: React.ReactNode;
  image?: string;
}> = ({ n, pt, es, subPt, subEs, visual, image }) => {
  const pop = usePop(3);
  const c = useCopy();
  return (
    <AbsoluteFill>
      <Bg image={image} />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: WIDTH,
          top: SAFE.top,
          bottom: SAFE.bottom,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              fontFamily: fonts.head,
              fontWeight: 700,
              fontSize: 150,
              lineHeight: 0.9,
              color: "transparent",
              WebkitTextStroke: `4px ${colors.accent}`,
              transform: `scale(${interpolate(pop, [0, 1], [0.4, 1])})`,
              opacity: Math.min(1, pop * 2),
            }}
          >
            0{n}
          </div>
          <Pill delay={6}>{c.reasonPill(n)}</Pill>
        </div>
        <Bi pt={pt} es={es} size={96} esSize={38} delay={8} />
        <Rise delay={20} from={20}>
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 34,
              lineHeight: 1.3,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {subPt}
            {subEs ? (
              <div
                style={{
                  fontSize: 28,
                  color: colors.accentLight,
                  marginTop: 6,
                }}
              >
                {subEs}
              </div>
            ) : null}
          </div>
        </Rise>
        <div style={{ flex: 1, position: "relative", marginTop: 6 }}>
          {visual}
        </div>
      </div>
      <Cut />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- 1. route ----
const P0 = { x: 780, y: 640 }; // São Paulo
const C = { x: 400, y: -60 };
const P2 = { x: 110, y: 330 }; // Assunção

const bez = (t: number) => ({
  x: (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * C.x + t * t * P2.x,
  y: (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * C.y + t * t * P2.y,
});
const bezAngle = (t: number) => {
  const dx = 2 * (1 - t) * (C.x - P0.x) + 2 * t * (P2.x - C.x);
  const dy = 2 * (1 - t) * (C.y - P0.y) + 2 * t * (P2.y - C.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

const Route: React.FC = () => {
  const c = useCopy();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [26, 84], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const pos = bez(p);
  const ang = bezAngle(p);
  const arrive = spring({
    frame: frame - 84,
    fps,
    config: { damping: 9, stiffness: 160 },
  });
  const pulse = (frame % 40) / 40;
  const chip = useSmooth(60);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg
        viewBox="0 0 878 860"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <path
          d={`M ${P0.x} ${P0.y} Q ${C.x} ${C.y} ${P2.x} ${P2.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={5}
          strokeDasharray="4 16"
          strokeLinecap="round"
        />
        <path
          d={`M ${P0.x} ${P0.y} Q ${C.x} ${C.y} ${P2.x} ${P2.y}`}
          fill="none"
          stroke={cream}
          strokeWidth={7}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${p} 1`}
        />
        <circle
          cx={P0.x}
          cy={P0.y}
          r={14 + pulse * 26}
          fill="none"
          stroke={colors.accent}
          strokeOpacity={1 - pulse}
          strokeWidth={4}
        />
        <circle cx={P0.x} cy={P0.y} r={14} fill={colors.accent} />
        <circle
          cx={P2.x}
          cy={P2.y}
          r={18 + pulse * 26}
          fill="none"
          stroke={cream}
          strokeOpacity={arrive > 0.3 ? 1 - pulse : 0}
          strokeWidth={4}
        />
        <circle
          cx={P2.x}
          cy={P2.y}
          r={18 * Math.min(1.2, arrive)}
          fill={cream}
        />
        <g transform={`translate(${pos.x} ${pos.y}) rotate(${ang})`}>
          <polygon points="-26,-17 30,0 -26,17 -14,0" fill="#fff" />
        </g>
        <text
          x={P0.x}
          y={P0.y + 64}
          textAnchor="middle"
          fill="#fff"
          fontFamily={fonts.head}
          fontWeight={700}
          fontSize={44}
        >
          {c.origin}
        </text>
        <text
          x={P2.x + 24}
          y={P2.y + 70}
          textAnchor="middle"
          fill={cream}
          fontFamily={fonts.head}
          fontWeight={700}
          fontSize={44}
        >
          {c.city[0]}
        </text>
        {c.city[1] ? (
          <text
            x={P2.x + 24}
            y={P2.y + 102}
            textAnchor="middle"
            fill={colors.accentLight}
            fontFamily={fonts.body}
            fontSize={26}
          >
            {c.city[1]}
          </text>
        ) : null}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 20,
          display: "flex",
          justifyContent: "center",
          opacity: chip,
          transform: `translateY(${interpolate(chip, [0, 1], [30, 0])}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 999,
            padding: "16px 38px",
            textAlign: "center",
            fontFamily: fonts.body,
            fontWeight: 500,
            fontSize: 32,
            color: "#fff",
          }}
        >
          {c.routeChip[0]}
          {c.routeChip[1] ? (
            <div style={{ fontSize: 26, color: colors.accentLight }}>
              {c.routeChip[1]}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------- 2. life photos ----
const Chip: React.FC<{ children: React.ReactNode; delay: number }> = ({
  children,
  delay,
}) => {
  const s = usePop(delay);
  return (
    <div
      style={{
        background: "rgba(28,11,20,0.78)",
        border: "1px solid rgba(255,255,255,0.28)",
        borderRadius: 999,
        padding: "12px 26px",
        color: "#fff",
        fontFamily: fonts.body,
        fontWeight: 500,
        fontSize: 30,
        transform: `scale(${interpolate(s, [0, 1], [0.5, 1])})`,
        opacity: Math.min(1, s * 2),
      }}
    >
      {children}
    </div>
  );
};

const Life: React.FC = () => {
  const c = useCopy();
  const a = useSmooth(24);
  const b = useSmooth(34);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Photo
        src="img/inmuebles/cumbres-vista-lago.jpg"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 740,
          height: 430,
          transform: `translateX(${interpolate(a, [0, 1], [-500, 0])}px) rotate(-3deg)`,
          opacity: a,
        }}
      />
      <Photo
        src="img/inmuebles/el-delta-marina.jpg"
        style={{
          position: "absolute",
          right: 0,
          top: 250,
          width: 740,
          height: 430,
          transform: `translateX(${interpolate(b, [0, 1], [500, 0])}px) rotate(3deg)`,
          opacity: b,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        {c.chips.map(([main, sub], i) => (
          <Chip key={main} delay={52 + i * 8}>
            {sub ? `${main} · ${sub}` : main}
          </Chip>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------ 3. fiscal ----
const Shield: React.FC = () => {
  const c = useCopy();
  const frame = useCurrentFrame();
  const s = usePop(22);
  const check = interpolate(frame, [40, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow = 22 + Math.sin(frame / 8) * 8;
  const rows = c.rows;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", height: 330 }}>
        <svg
          viewBox="-140 -170 280 350"
          height={330}
          style={{
            transform: `scale(${interpolate(s, [0, 1], [0.3, 1])})`,
            filter: `drop-shadow(0 0 ${glow}px ${colors.accent})`,
          }}
        >
          <path
            d="M 0 -150 L 120 -105 V 10 C 120 90 60 140 0 170 C -60 140 -120 90 -120 10 V -105 Z"
            fill={colors.brand}
            stroke={colors.accentLight}
            strokeWidth={8}
          />
          <path
            d="M -50 5 L -12 45 L 55 -35"
            fill="none"
            stroke={cream}
            strokeWidth={22}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={`${check} 1`}
          />
        </svg>
      </div>
      {rows.map(([pt, es], i) => (
        <Rise key={pt} delay={46 + i * 9} from={40}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              background: "rgba(255,255,255,0.09)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 22,
              padding: "22px 30px",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                background: cream,
                color: colors.dark900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fonts.head,
                fontWeight: 700,
                fontSize: 30,
              }}
            >
              ✓
            </div>
            <div>
              <div
                style={{
                  fontFamily: fonts.head,
                  fontWeight: 600,
                  fontSize: 48,
                  color: "#fff",
                  lineHeight: 1.1,
                }}
              >
                {pt}
              </div>
              {es ? (
                <div
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 31,
                    color: colors.accentLight,
                  }}
                >
                  {es}
                </div>
              ) : null}
            </div>
          </div>
        </Rise>
      ))}
    </div>
  );
};

// ------------------------------------------------------- 4. investments ----
const Projects: React.FC = () => {
  const items: Array<[string, string, string]> = [
    ["img/inmuebles/torre-narciso-fachada.jpg", "Torre Narciso", "Asunción"],
    [
      "img/inmuebles/belive-torreani-fachada.jpg",
      "Belive Torreani",
      "Recoleta, Asunción",
    ],
    [
      "img/inmuebles/aura-avanza-fachada.jpg",
      "Aura Japandi Residences",
      "Villa Morra, Asunción",
    ],
  ];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {items.map(([src, name, zone], i) => (
        <Slide key={name} delay={26 + i * 9}>
          <Photo src={src} style={{ position: "absolute", inset: 0 }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 120,
              background:
                "linear-gradient(0deg, rgba(28,11,20,0.9), transparent)",
              borderRadius: "0 0 28px 28px",
            }}
          />
          <div style={{ position: "absolute", left: 28, bottom: 16 }}>
            <div
              style={{
                fontFamily: fonts.head,
                fontWeight: 700,
                fontSize: 38,
                color: "#fff",
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: 24,
                color: colors.accentLight,
              }}
            >
              {zone}
            </div>
          </div>
        </Slide>
      ))}
    </div>
  );
};

const Slide: React.FC<{ delay: number; children: React.ReactNode }> = ({
  delay,
  children,
}) => {
  const s = useSmooth(delay);
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        transform: `translateX(${interpolate(s, [0, 1], [700, 0])}px)`,
        opacity: s,
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------- scenes ---
const VISUALS: Array<{ visual: React.ReactNode; image?: string }> = [
  { visual: <Route />, image: "img/hero-paraguay.jpg" },
  { visual: <Life />, image: "img/inmuebles/cumbres-vista-aerea.jpg" },
  { visual: <Shield /> },
  { visual: <Projects />, image: "img/inmuebles/riverside-zafiro-aerea.jpg" },
];

const ReasonScene: React.FC<{ index: 0 | 1 | 2 | 3 }> = ({ index }) => {
  const r = useCopy().reasons[index];
  return (
    <Reason
      n={index + 1}
      pt={
        <>
          {r.title.pre}
          <Mark>{r.title.mark}</Mark>
          {r.title.post}
        </>
      }
      es={r.es}
      subPt={r.sub}
      subEs={r.subEs}
      visual={VISUALS[index].visual}
      image={VISUALS[index].image}
    />
  );
};

export const Reason1: React.FC = () => <ReasonScene index={0} />;
export const Reason2: React.FC = () => <ReasonScene index={1} />;
export const Reason3: React.FC = () => <ReasonScene index={2} />;
export const Reason4: React.FC = () => <ReasonScene index={3} />;

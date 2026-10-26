import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { colors, fonts } from "../Showcase/theme";
import {
  Bg,
  Bi,
  Cut,
  Mark,
  Pill,
  Rise,
  SAFE,
  WIDTH,
  cream,
  usePop,
} from "./kit";
import { useCopy } from "./lang";
import { Reason } from "./Reasons";

const useEas = () => {
  const c = useCopy();
  if (!c.eas) throw new Error("This scene needs the 'eas' copy");
  return { c, e: c.eas };
};

// ---------------------------------------------------------------- shared ---
const Rows: React.FC<{
  items: Array<[string, string?]>;
  numbered?: boolean;
  start?: number;
  step?: number;
}> = ({ items, numbered, start = 30, step = 9 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}
  >
    {items.map(([pt, es], i) => (
      <Rise key={pt} delay={start + i * step} from={40}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            background: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 22,
            padding: "18px 28px",
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              flexShrink: 0,
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
            {numbered ? i + 1 : "✓"}
          </div>
          <div>
            <div
              style={{
                fontFamily: fonts.head,
                fontWeight: 600,
                fontSize: 44,
                color: "#fff",
                lineHeight: 1.1,
              }}
            >
              {pt}
            </div>
            {es && es !== pt ? (
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 29,
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

// ------------------------------------------------------------- 1. calendar --
const Calendar: React.FC = () => {
  const { e } = useEas();
  const card = usePop(20);
  const badge = usePop(44);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 34,
      }}
    >
      <div
        style={{
          width: 640,
          borderRadius: 36,
          background: "#fff",
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          transform: `scale(${interpolate(card, [0, 1], [0.6, 1])}) rotate(${interpolate(card, [0, 1], [-6, 0])}deg)`,
          opacity: Math.min(1, card * 2),
        }}
      >
        <div
          style={{
            background: colors.brand,
            color: "#fff",
            fontFamily: fonts.head,
            fontWeight: 700,
            fontSize: 66,
            textAlign: "center",
            padding: "18px 0",
            letterSpacing: 8,
          }}
        >
          {e.calendar.month}
        </div>
        <div
          style={{
            fontFamily: fonts.head,
            fontWeight: 700,
            fontSize: 330,
            lineHeight: 1.05,
            textAlign: "center",
            color: colors.dark900,
          }}
        >
          {e.calendar.day}
        </div>
        <div
          style={{
            textAlign: "center",
            fontFamily: fonts.body,
            fontSize: 34,
            color: "#64748b",
            paddingBottom: 26,
          }}
        >
          {e.calendar.weekday[0]}
          {e.calendar.weekday[1] ? ` · ${e.calendar.weekday[1]}` : ""}
        </div>
      </div>
      <div
        style={{
          background: cream,
          color: colors.dark900,
          borderRadius: 22,
          padding: "16px 34px",
          textAlign: "center",
          transform: `scale(${interpolate(badge, [0, 1], [0.5, 1])})`,
          opacity: Math.min(1, badge * 2),
        }}
      >
        <div style={{ fontFamily: fonts.head, fontWeight: 700, fontSize: 44 }}>
          {e.calendar.badge[0]}
        </div>
        {e.calendar.badge[1] ? (
          <div
            style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 28 }}
          >
            {e.calendar.badge[1]}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------- SIARA ---
const Siara: React.FC = () => {
  const { e } = useEas();
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
      {e.siara.map((row, i) => (
        <Rise key={row.who[0]} delay={28 + i * 14} from={50}>
          <div
            style={{
              background: i === 0 ? "rgba(255,255,255,0.1)" : colors.brand,
              border: `2px solid ${i === 0 ? "rgba(255,255,255,0.25)" : colors.accentLight}`,
              borderRadius: 28,
              padding: "26px 34px",
            }}
          >
            <div
              style={{
                fontFamily: fonts.head,
                fontWeight: 600,
                fontSize: 34,
                letterSpacing: 3,
                color: colors.accentLight,
              }}
            >
              {row.who[0]}
              {row.who[1] && row.who[1] !== row.who[0]
                ? ` · ${row.who[1]}`
                : ""}
            </div>
            <div
              style={{
                fontFamily: fonts.head,
                fontWeight: 700,
                fontSize: 80,
                color: "#fff",
                lineHeight: 1.1,
                marginTop: 6,
              }}
            >
              {row.system[0]}
            </div>
            <div
              style={{
                fontFamily: fonts.body,
                fontWeight: 500,
                fontSize: 32,
                color: "#fff",
                marginTop: 4,
              }}
            >
              {row.detail[0]}
              {row.detail[1] ? (
                <div style={{ fontSize: 27, color: colors.accentLight }}>
                  {row.detail[1]}
                </div>
              ) : null}
            </div>
          </div>
        </Rise>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- scenes ----
export const Eas1: React.FC = () => (
  <EasReason index={0} visual={<Calendar />} image="img/hero-paraguay.jpg" />
);
export const Eas2: React.FC = () => {
  const { e } = useEas();
  return <EasReason index={1} visual={<Rows items={e.scope} />} />;
};
export const Eas3: React.FC = () => {
  const { e } = useEas();
  return <EasReason index={2} visual={<Rows items={e.signers} />} />;
};
export const Eas4: React.FC = () => (
  <EasReason index={3} visual={<Siara />} image="img/wtc-asuncion.jpg" />
);

const EasReason: React.FC<{
  index: 0 | 1 | 2 | 3;
  visual: React.ReactNode;
  image?: string;
}> = ({ index, visual, image }) => {
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
      visual={visual}
      image={image}
    />
  );
};

// ------------------------------------------------------------- checklist ----
export const EasChecklist: React.FC = () => {
  const { e } = useEas();
  return (
    <AbsoluteFill>
      <Bg image="img/hero-paraguay.jpg" opacity={0.25} blur={12} />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: WIDTH,
          top: SAFE.top,
          bottom: SAFE.bottom,
          display: "flex",
          flexDirection: "column",
          gap: 30,
        }}
      >
        <Pill delay={2}>{e.checklistPill}</Pill>
        <Bi
          pt={
            <>
              {e.checklistTitle.pre}
              <Mark>{e.checklistTitle.mark}</Mark>
            </>
          }
          es={e.checklistEs}
          size={100}
          esSize={38}
          delay={6}
        />
        <div style={{ position: "relative", flex: 1 }}>
          <Rows items={e.checklist} numbered start={34} step={22} />
        </div>
        <Rise delay={120}>
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 27,
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {e.source[0]}
            {e.source[1] ? (
              <div style={{ color: colors.accentLight }}>{e.source[1]}</div>
            ) : null}
          </div>
        </Rise>
      </div>
      <Cut />
    </AbsoluteFill>
  );
};

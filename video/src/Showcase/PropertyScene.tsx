import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Photo } from "./Photo";
import { colors, fonts, SCENE_FRAMES } from "./theme";
import type { Property } from "./types";

const CROSSFADE = 20;

const shorten = (text: string, max: number) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;]$/, "") + "…";
};

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: fonts.body,
      fontWeight: 500,
      fontSize: 26,
      color: colors.white,
      background: "rgba(255,255,255,0.14)",
      border: "1px solid rgba(255,255,255,0.28)",
      borderRadius: 999,
      padding: "10px 24px",
    }}
  >
    {children}
  </div>
);

export const PropertyScene: React.FC<{
  property: Property;
  index: number;
  total: number;
}> = ({ property, index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [first, second] = property.photos;
  const mid = Math.floor(SCENE_FRAMES / 2);
  const direction = index % 2 === 0 ? 1 : -1;

  const enter = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const rise = (delay: number) => ({
    opacity: enter(delay),
    transform: `translateY(${interpolate(enter(delay), [0, 1], [30, 0])}px)`,
  });

  const secondOpacity = interpolate(frame, [mid - CROSSFADE / 2, mid + CROSSFADE / 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chips = [
    property.unidades && shorten(property.unidades, 48),
    property.estado,
    property.entrega && `Entrega ${property.entrega}`,
  ].filter(Boolean);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.dark950 }}>
      <Photo photo={first} duration={SCENE_FRAMES} direction={direction} />
      {second ? (
        <Sequence from={mid - CROSSFADE / 2} layout="none">
          <AbsoluteFill style={{ opacity: secondOpacity }}>
            <Photo
              photo={second}
              duration={SCENE_FRAMES - mid + CROSSFADE / 2}
              direction={direction === 1 ? -1 : 1}
            />
          </AbsoluteFill>
        </Sequence>
      ) : null}

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(28,11,20,0.85) 0%, rgba(28,11,20,0.35) 45%, rgba(28,11,20,0) 65%), linear-gradient(0deg, rgba(28,11,20,0.9) 0%, rgba(28,11,20,0) 55%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 70,
          left: 100,
          fontFamily: fonts.head,
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: 4,
          color: colors.accentLight,
          ...rise(0),
        }}
      >
        SOSA GROUP REAL ESTATE
        <span style={{ color: "rgba(255,255,255,0.6)", marginLeft: 24 }}>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 100,
          bottom: 100,
          width: 780,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            width: interpolate(enter(4), [0, 1], [0, 120]),
            height: 6,
            borderRadius: 3,
            background: colors.accent,
          }}
        />
        <div
          style={{
            fontFamily: fonts.head,
            fontWeight: 700,
            fontSize: property.titulo.length > 22 ? 72 : 88,
            lineHeight: 1.05,
            color: colors.white,
            ...rise(6),
          }}
        >
          {property.titulo}
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 30,
            lineHeight: 1.35,
            color: "rgba(255,255,255,0.85)",
            ...rise(12),
          }}
        >
          {shorten(property.zona, 90)}
        </div>
        {chips.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8, ...rise(18) }}>
            {chips.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

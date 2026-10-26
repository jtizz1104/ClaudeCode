import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../Showcase/theme";

// Safe zone for Reels / TikTok: their UI covers the right edge, the bottom
// and the very top of the screen.
export const SAFE = { left: 72, right: 130, top: 190, bottom: 290 };
export const WIDTH = 1080 - SAFE.left - SAFE.right;
export const cream = "#f2d9a0";

export const useSmooth = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200 } });
};

export const usePop = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 11, stiffness: 160, mass: 0.7 },
  });
};

export const Rise: React.FC<{
  delay?: number;
  from?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, from = 36, children, style }) => {
  const s = useSmooth(delay);
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [from, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Mark: React.FC<{
  children: React.ReactNode;
  color?: string;
  ink?: string;
}> = ({ children, color = colors.accentLight, ink = colors.dark900 }) => (
  <span
    style={{
      background: color,
      color: ink,
      padding: "0 16px",
      borderRadius: 12,
      WebkitBoxDecorationBreak: "clone",
      boxDecorationBreak: "clone",
    }}
  >
    {children}
  </span>
);

// Portuguese big, Spanish smaller underneath.
export const Bi: React.FC<{
  pt: React.ReactNode;
  es?: React.ReactNode;
  size?: number;
  esSize?: number;
  delay?: number;
  align?: "left" | "center";
  gap?: number;
}> = ({
  pt,
  es,
  size = 100,
  esSize = 38,
  delay = 0,
  align = "left",
  gap = 18,
}) => (
  <div
    style={{ textAlign: align, display: "flex", flexDirection: "column", gap }}
  >
    <Rise delay={delay}>
      <div
        style={{
          fontFamily: fonts.head,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.08,
          color: colors.white,
        }}
      >
        {pt}
      </div>
    </Rise>
    {es ? (
      <Rise delay={delay + 6} from={24}>
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 500,
            fontSize: esSize,
            lineHeight: 1.25,
            color: colors.accentLight,
          }}
        >
          {es}
        </div>
      </Rise>
    ) : null}
  </div>
);

export const Pill: React.FC<{
  children: React.ReactNode;
  delay?: number;
  color?: string;
  ink?: string;
  font?: string;
}> = ({
  children,
  delay = 0,
  color = colors.brand,
  ink = "#fff",
  font = fonts.head,
}) => {
  const s = usePop(delay);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        background: color,
        color: ink,
        fontFamily: font,
        fontWeight: 600,
        fontSize: 30,
        letterSpacing: 4,
        padding: "13px 28px",
        borderRadius: 16,
        transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
        opacity: Math.min(1, s * 2),
        transformOrigin: "left center",
      }}
    >
      {children}
    </div>
  );
};

export const Bg: React.FC<{
  image?: string;
  opacity?: number;
  blur?: number;
}> = ({ image, opacity = 0.32, blur = 10 }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 55) * 6;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${colors.dark900} 0%, ${colors.dark950} 55%, #12060d 100%)`,
      }}
    >
      {image ? (
        <Img
          src={staticFile(image)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity,
            filter: `blur(${blur}px) saturate(1.15)`,
            transform: `scale(${1.15 + frame * 0.0005})`,
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 760px at ${28 + drift}% 18%, ${colors.brand}77, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(800px 800px at ${92 - drift}% 88%, ${colors.brand}55, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Brand-colored panel that sweeps off to the right at the start of a scene.
export const Cut: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 9], [0, 1], { extrapolateRight: "clamp" });
  if (p >= 1) return null;
  return (
    <AbsoluteFill
      style={{
        background: colors.brand,
        transform: `translateX(${p * 105}%)`,
        zIndex: 60,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -14,
          top: 0,
          bottom: 0,
          width: 14,
          background: colors.accentLight,
        }}
      />
    </AbsoluteFill>
  );
};

export const Flag: React.FC = () => (
  <div
    style={{
      width: 44,
      height: 30,
      borderRadius: 6,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div style={{ flex: 1, background: "#d52b1e" }} />
    <div style={{ flex: 1, background: "#ffffff" }} />
    <div style={{ flex: 1, background: "#0038a8" }} />
  </div>
);

export const Photo: React.FC<{
  src: string;
  style?: React.CSSProperties;
  zoom?: number;
}> = ({ src, style, zoom = 0.0006 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        overflow: "hidden",
        borderRadius: 28,
        boxShadow: "0 28px 70px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${1.06 + frame * zoom})`,
        }}
      />
    </div>
  );
};

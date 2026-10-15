import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts, INTRO_FRAMES } from "./theme";

export const Intro: React.FC<{ count: number }> = ({ count }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const scale = interpolate(frame, [0, INTRO_FRAMES], [1.15, 1.05]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.dark950 }}>
      <Img
        src={staticFile("img/hero-paraguay.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${colors.dark950}ee 0%, ${colors.brand}aa 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 28,
        }}
      >
        <div
          style={{
            fontFamily: fonts.head,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: 12,
            color: colors.accentLight,
            opacity: enter(0),
          }}
        >
          SOSA GROUP
        </div>
        <div
          style={{
            fontFamily: fonts.head,
            fontWeight: 700,
            fontSize: 150,
            lineHeight: 1,
            color: colors.white,
            opacity: enter(8),
            transform: `translateY(${interpolate(enter(8), [0, 1], [40, 0])}px)`,
          }}
        >
          Real Estate
        </div>
        <div
          style={{
            width: interpolate(enter(16), [0, 1], [0, 160]),
            height: 6,
            borderRadius: 3,
            background: colors.accent,
          }}
        />
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 40,
            color: "rgba(255,255,255,0.9)",
            opacity: enter(22),
          }}
        >
          {count} desarrollos en Paraguay
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

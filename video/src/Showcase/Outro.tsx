import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "./theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const rise = (delay: number) => ({
    opacity: enter(delay),
    transform: `translateY(${interpolate(enter(delay), [0, 1], [30, 0])}px)`,
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 30% 30%, ${colors.brand} 0%, ${colors.dark900} 55%, ${colors.dark950} 100%)`,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        gap: 30,
      }}
    >
      <div
        style={{
          fontFamily: fonts.head,
          fontWeight: 600,
          fontSize: 34,
          letterSpacing: 12,
          color: colors.accentLight,
          ...rise(0),
        }}
      >
        SOSA GROUP REAL ESTATE
      </div>
      <div
        style={{
          fontFamily: fonts.head,
          fontWeight: 700,
          fontSize: 96,
          lineHeight: 1.1,
          color: colors.white,
          maxWidth: 1400,
          ...rise(6),
        }}
      >
        Encontrá tu próxima inversión
      </div>
      <div
        style={{
          width: interpolate(enter(14), [0, 1], [0, 160]),
          height: 6,
          borderRadius: 3,
          background: colors.accent,
        }}
      />
      <div
        style={{
          fontFamily: fonts.body,
          fontWeight: 500,
          fontSize: 42,
          color: colors.white,
          ...rise(18),
        }}
      >
        sosagroup.com.py/real-estate
      </div>
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 36,
          color: "rgba(255,255,255,0.85)",
          ...rise(24),
        }}
      >
        WhatsApp +595 983 384 618
      </div>
    </AbsoluteFill>
  );
};

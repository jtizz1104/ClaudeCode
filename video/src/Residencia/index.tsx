import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { colors, fonts } from "../Showcase/theme";
import { SAFE } from "./kit";
import { COPY, LangContext, type Lang } from "./lang";
import music from "./music.mp3";
import { Reason1, Reason2, Reason3, Reason4 } from "./Reasons";
import { Bridge, Cta, Hook, Reviews, Why } from "./Story";

// 120 BPM: one bar = 60 frames. Every scene starts on a bar line.
export const RESIDENCIA_FRAMES = 1320;

const SCENES: Array<{ from: number; frames: number; node: React.ReactNode }> = [
  { from: 0, frames: 120, node: <Hook /> },
  { from: 120, frames: 120, node: <Reason1 /> },
  { from: 240, frames: 120, node: <Reason2 /> },
  { from: 360, frames: 120, node: <Reason3 /> },
  { from: 480, frames: 120, node: <Reason4 /> },
  { from: 600, frames: 60, node: <Bridge /> },
  { from: 660, frames: 180, node: <Why /> },
  { from: 840, frames: 300, node: <Reviews /> },
  { from: 1140, frames: 180, node: <Cta /> },
];

const Header: React.FC<{ lang: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, RESIDENCIA_FRAMES], [0, 1]);
  const fade = interpolate(frame, [1258, 1268], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const show = frame >= 6 ? 1 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        right: SAFE.right,
        top: 78,
        zIndex: 100,
        opacity: fade * show,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            background: colors.brand,
            border: `2px solid ${colors.accentLight}`,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: fonts.head,
            fontWeight: 700,
            fontSize: 34,
          }}
        >
          S
        </div>
        <div>
          <div
            style={{
              fontFamily: fonts.head,
              fontWeight: 700,
              fontSize: 34,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            SosaGroup
          </div>
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 19,
              color: colors.accentLight,
              marginTop: 2,
            }}
          >
            {COPY[lang].tagline}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 16,
          height: 5,
          borderRadius: 3,
          background: "rgba(255,255,255,0.22)",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            borderRadius: 3,
            background: colors.accentLight,
          }}
        />
      </div>
    </div>
  );
};

export type ResidenciaProps = { lang: Lang };

export const Residencia: React.FC<ResidenciaProps> = ({ lang }) => (
  <LangContext.Provider value={lang}>
    <AbsoluteFill style={{ background: colors.dark950 }}>
      <Audio src={music} />
      {SCENES.map((s) => (
        <Sequence key={s.from} from={s.from} durationInFrames={s.frames}>
          {s.node}
        </Sequence>
      ))}
      <Header lang={lang} />
    </AbsoluteFill>
  </LangContext.Provider>
);

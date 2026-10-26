import { Composition } from "remotion";
import { Showcase, SHOWCASE_FRAMES } from "./Showcase";
import { FPS } from "./Showcase/theme";
import { Residencia, RESIDENCIA_FRAMES } from "./Residencia";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // Render with: npm run render
        id="Showcase"
        component={Showcase}
        durationInFrames={SHOWCASE_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        // Vertical 9:16 for Reels / TikTok. Render with: npm run render:residencia
        id="Residencia"
        component={Residencia}
        durationInFrames={RESIDENCIA_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ lang: "pt" as const }}
      />
      <Composition
        // Same reel with the revised texts (Propuesta-nueva-version). Render with: npm run render:propuesta
        id="Propuesta"
        component={Residencia}
        durationInFrames={RESIDENCIA_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ lang: "pt2" as const }}
      />
      <Composition
        // EAS: mandatory qualified electronic signature (from 9 Nov 2026). npm run render:eas
        id="EasFirmaElectronica"
        component={Residencia}
        durationInFrames={RESIDENCIA_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ lang: "eas" as const }}
      />
      <Composition
        // Same reel in English. Render with: npm run render:residencia:en
        id="ResidenciaEN"
        component={Residencia}
        durationInFrames={RESIDENCIA_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ lang: "en" as const }}
      />
    </>
  );
};

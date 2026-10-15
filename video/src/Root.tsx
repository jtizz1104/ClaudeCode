import { Composition } from "remotion";
import { Showcase, SHOWCASE_FRAMES } from "./Showcase";
import { FPS } from "./Showcase/theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      // Render with: npm run render
      id="Showcase"
      component={Showcase}
      durationInFrames={SHOWCASE_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};

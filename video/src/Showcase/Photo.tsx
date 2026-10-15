import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { PhotoData } from "./types";

// Wide photos fill the frame with a slow Ken Burns zoom. Tall or square ones
// would lose too much when cropped to 16:9, so they sit framed on the right
// over a blurred copy of themselves.
export const Photo: React.FC<{
  photo: PhotoData;
  duration: number;
  direction: 1 | -1;
}> = ({ photo, duration, direction }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
  });
  const src = staticFile(photo.src);
  const wide = photo.w / photo.h >= 1.3;

  if (wide) {
    const scale = interpolate(progress, [0, 1], [1.12, 1.02]);
    const x = interpolate(progress, [0, 1], [-20 * direction, 20 * direction]);
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translateX(${x}px)`,
          }}
        />
      </AbsoluteFill>
    );
  }

  const scale = interpolate(progress, [0, 1], [1, 1.05]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(40px) brightness(0.45)",
          transform: "scale(1.2)",
        }}
      />
      <div
        style={{
          position: "absolute",
          display: "flex",
          left: 920,
          right: 100,
          top: 90,
          bottom: 90,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={src}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: 18,
            boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
            transform: `scale(${scale})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

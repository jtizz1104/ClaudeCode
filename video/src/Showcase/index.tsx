import { fade } from "@remotion/transitions/fade";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { Fragment } from "react";
import data from "../properties.json";
import { Intro } from "./Intro";
import { Outro } from "./Outro";
import { PropertyScene } from "./PropertyScene";
import { INTRO_FRAMES, OUTRO_FRAMES, SCENE_FRAMES, TRANSITION_FRAMES } from "./theme";
import type { Property } from "./types";

export const properties = data as Property[];

// Every scene overlaps the next one by one transition.
export const SHOWCASE_FRAMES =
  INTRO_FRAMES +
  properties.length * SCENE_FRAMES +
  OUTRO_FRAMES -
  (properties.length + 1) * TRANSITION_FRAMES;

const transition = (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
  />
);

export const Showcase: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={INTRO_FRAMES}>
      <Intro count={properties.length} />
    </TransitionSeries.Sequence>
    {properties.map((p, i) => (
      <Fragment key={p.id}>
        {transition}
        <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
          <PropertyScene property={p} index={i} total={properties.length} />
        </TransitionSeries.Sequence>
      </Fragment>
    ))}
    {transition}
    <TransitionSeries.Sequence durationInFrames={OUTRO_FRAMES}>
      <Outro />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);

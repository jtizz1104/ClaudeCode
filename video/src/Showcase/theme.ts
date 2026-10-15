import { loadFont } from "@remotion/fonts";
import interUrl from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2";
import outfitUrl from "@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2";

// Same typefaces as the website, bundled so rendering needs no network.
loadFont({ family: "Outfit", url: outfitUrl, weight: "100 900" });
loadFont({ family: "Inter", url: interUrl, weight: "100 900" });

// Brand colors from sosagroup/assets/styles.css
export const colors = {
  dark950: "#1c0b14",
  dark900: "#2c1020",
  brand: "#8a2454",
  accent: "#c86b98",
  accentLight: "#f2c1d8",
  white: "#ffffff",
};

export const fonts = {
  head: "Outfit, sans-serif",
  body: "Inter, sans-serif",
};

export const FPS = 30;
export const INTRO_FRAMES = 105;
export const SCENE_FRAMES = 135;
export const OUTRO_FRAMES = 150;
export const TRANSITION_FRAMES = 15;

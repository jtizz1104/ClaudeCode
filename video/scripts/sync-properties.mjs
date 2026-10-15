// Reads the SosaGroup property list (sosagroup/assets/data/inmuebles.js) and
// writes src/properties.json with what the video needs. Run it again after
// adding or editing projects on the site:  npm run sync
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.resolve(here, "../../sosagroup/assets");
const out = path.resolve(here, "../src/properties.json");

const sandbox = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(assets, "data/inmuebles.js"), "utf8"),
  sandbox,
);

// Width and height from a JPEG's SOF marker, so we can skip panoramas that
// would look blurry when cropped to 16:9.
const jpegSize = (file) => {
  const b = fs.readFileSync(file);
  let i = 2;
  while (i < b.length) {
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
};

// Paths in the data are relative to the site root ("assets/img/..."); the
// video's public dir is sosagroup/assets, so drop the "assets/" prefix.
const toPublic = (p) => p.replace(/^assets\//, "");

const usable = (p) => {
  const file = path.join(assets, toPublic(p));
  if (!fs.existsSync(file)) return false;
  const size = jpegSize(file);
  return !size || size.w / size.h <= 2;
};

const properties = sandbox.window.SOSA_INMUEBLES.filter(
  (p) => !p.ejemplo && p.foto,
).map((p) => {
  const photos = [p.foto, ...(p.galeria ?? []).filter((g) => g !== p.foto)]
    .filter(usable)
    .slice(0, 2)
    .map((src) => {
      const size = jpegSize(path.join(assets, toPublic(src)));
      return { src: toPublic(src), w: size?.w ?? 16, h: size?.h ?? 9 };
    });
  return {
    id: p.id,
    titulo: p.titulo,
    zona: p.zona,
    unidades: p.unidades && Number.isNaN(Number(p.unidades)) ? p.unidades : null,
    entrega: p.entrega ?? null,
    estado: p.estado ?? null,
    photos,
  };
});

fs.writeFileSync(out, JSON.stringify(properties, null, 2) + "\n");
console.log(`Wrote ${properties.length} properties to ${path.relative(process.cwd(), out)}`);

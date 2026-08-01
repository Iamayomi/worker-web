import fs from "node:fs";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";

const topojson = JSON.parse(
  fs.readFileSync(new URL("../public/world-atlas-countries.json", import.meta.url), "utf-8"),
);

const world = feature(topojson, topojson.objects.countries);

const W = 800;
const H = 400;
const STEP = 2.6;

function px(lon, lat) {
  const x = ((lon + 180) / 360) * W;
  const clamped = Math.max(-85, Math.min(85, lat));
  const merc = Math.log(Math.tan(Math.PI / 4 + (clamped * Math.PI) / 360));
  const y = (0.5 - merc / (2 * Math.PI)) * H;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

const dots = [];
for (let lon = -180; lon < 180; lon += STEP) {
  for (let lat = -85; lat <= 85; lat += STEP) {
    if (geoContains(world, [lon, lat])) dots.push(px(lon, lat));
  }
}

const cities = {
  "San Francisco": [-122.42, 37.77],
  "New York": [-74.01, 40.71],
  London: [-0.13, 51.51],
  Lagos: [3.38, 6.52],
  Nairobi: [36.82, -1.29],
  Dubai: [55.27, 25.2],
  Singapore: [103.82, 1.35],
  Tokyo: [139.69, 35.68],
  Sydney: [151.21, -33.87],
  "Sao Paulo": [-46.63, -23.55],
};

const projected = Object.entries(cities).map(([name, [lon, lat]]) => ({ name, point: px(lon, lat) }));

const out = `export type Dot = readonly [number, number];

export const worldDots: Dot[] = ${JSON.stringify(dots)};

export const cityMarkers: { name: string; point: Dot }[] = ${JSON.stringify(projected)};
`;

fs.writeFileSync(new URL("../components/world-dots-data.ts", import.meta.url), out);
console.log("dots:", dots.length, "cities:", projected.length);

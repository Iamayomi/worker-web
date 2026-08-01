"use client";

import { cityMarkers, worldDots } from "./world-dots-data";

const twinkle = Array.from({ length: worldDots.length }, (_, i) => i % 47 === 0);

export function WorldMap() {
  return (
    <svg
      viewBox="0 0 800 400"
      className="h-auto w-full"
      role="img"
      aria-label="Animated world map showing global reach"
    >
      {worldDots.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={2}
          fill="var(--muted)"
          className={twinkle[i] ? "map-twinkle" : undefined}
        />
      ))}
      {cityMarkers.map((city) => (
        <g key={city.name}>
          <circle cx={city.point[0]} cy={city.point[1]} r={9} fill="var(--primary)" opacity={0.35} className="map-pulse" />
          <circle cx={city.point[0]} cy={city.point[1]} r={9} fill="var(--primary)" opacity={0.2} className="map-pulse-delay" />
          <circle cx={city.point[0]} cy={city.point[1]} r={4} fill="var(--primary)" />
        </g>
      ))}
    </svg>
  );
}

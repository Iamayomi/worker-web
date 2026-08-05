"use client";

import { cn } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  className?: string;
  valueSuffix?: string;
}

/**
 * Hand-rolled SVG bar chart. Bars scale to the max value; a small label sits
 * under each bar.
 */
export function BarChart({
  data,
  height = 200,
  className,
  valueSuffix = "",
}: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const chartWidth = 100;
  const chartHeight = 100;
  const padding = 6;
  const barGap = 2;
  const barWidth =
    data.length > 0
      ? Math.max(
          1,
          (chartWidth - padding * 2 - barGap * (data.length - 1)) / data.length,
        )
      : 1;

  const bars = data.map((d, i) => {
    const x = padding + i * (barWidth + barGap);
    const h = (d.value / max) * (chartHeight - padding * 2);
    const y = chartHeight - padding - h;
    return { x, y, w: barWidth, h, ...d };
  });

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="none"
        className="block w-full"
        style={{ height }}
        role="img"
        aria-label="Bar chart"
      >
        {[0.25, 0.5, 0.75, 1].map((p) => {
          const y =
            chartHeight - padding - p * (chartHeight - padding * 2);
          return (
            <line
              key={p}
              x1={padding}
              x2={chartWidth - padding}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={0.3}
            />
          );
        })}
        {bars.map((b) => (
          <title key={b.label}>{`${b.label}: ${b.value}${valueSuffix}`}</title>
        ))}
        {bars.map((b) => (
          <rect
            key={b.label}
            x={b.x}
            y={b.y}
            width={b.w}
            height={Math.max(0.5, b.h)}
            rx={0.5}
            className="fill-primary/80 hover:fill-primary"
          />
        ))}
      </svg>
      <div className="mt-2 flex gap-1">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 truncate text-center text-[10px] text-muted-foreground"
            title={`${d.label}: ${d.value}${valueSuffix}`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

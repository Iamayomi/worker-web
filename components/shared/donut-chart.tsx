"use client";

import { cn } from "@/lib/utils";

export interface DonutDatum {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  className?: string;
}

const DEFAULT_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
  "#14b8a6",
  "#f97316",
];

/**
 * Hand-rolled SVG donut chart with a centered total and a legend.
 */
export function DonutChart({
  data,
  size = 160,
  thickness = 22,
  className,
}: DonutChartProps) {
  const total = Math.max(1, data.reduce((sum, d) => sum + d.value, 0));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const segments = data.map((d, i) => {
    const fraction = d.value / total;
    const dashOffset = circumference * (1 - cumulative - fraction);
    cumulative += fraction;
    return {
      ...d,
      key: `${d.label}-${i}`,
      dashArray: `${circumference * fraction} ${circumference}`,
      dashOffset,
      color: d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    };
  });

  return (
    <div className={cn("flex flex-wrap items-center gap-6", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label="Donut chart"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={thickness}
          />
          {segments.map((s) => (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={s.dashArray}
              strokeDashoffset={s.dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-opacity hover:opacity-80"
            >
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{data.reduce((sum, d) => sum + d.value, 0)}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>
      <ul className="flex-1 space-y-1.5">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="flex-1 truncate text-muted-foreground">
              {s.label}
            </span>
            <span className="font-medium">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

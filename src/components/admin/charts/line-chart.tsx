import { component$ } from "@builder.io/qwik";

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export const LineChart = component$<LineChartProps>(
  ({ data, color = "#4f46e5", height = 200 }) => {
    if (!data || data.length === 0) {
      return (
        <div class="flex items-center justify-center h-full text-gray-400">
          No data available
        </div>
      );
    }

    const padding = 20;
    const width = 1000; // Internal coordinate system width
    const maxValue = Math.max(...data.map((d) => d.value), 1); // Ensure at least 1 to avoid division by zero
    const points = data
      .map((d, i) => {
        const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
        const y =
          height - padding - (d.value / maxValue) * (height - 2 * padding);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div class="w-full" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          class="w-full h-full overflow-visible"
        >
          {/* Grid lines (optional, kept simple for now) */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#e5e7eb"
            stroke-width="1"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#e5e7eb"
            stroke-width="1"
          />

          {/* The Line */}
          <polyline
            fill="none"
            stroke={color}
            stroke-width="3"
            points={points}
            vector-effect="non-scaling-stroke"
          />

          {/* Data Points */}
          {data.map((d, i) => {
            const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
            const y =
              height - padding - (d.value / maxValue) * (height - 2 * padding);
            return (
              <g key={i} class="group">
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="white"
                  stroke={color}
                  stroke-width="2"
                  class="cursor-pointer transition-all duration-200 group-hover:r-6"
                />

                {/* Tooltip */}
                <foreignObject
                  x={x - 50}
                  y={y - 40}
                  width="100"
                  height="40"
                  class="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  <div class="flex flex-col items-center justify-center">
                    <span class="bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                      {d.label}: {d.value}
                    </span>
                  </div>
                </foreignObject>

                {/* X-Axis Label */}
                <text
                  x={x}
                  y={height}
                  text-anchor="middle"
                  font-size="12"
                  fill="#6b7280"
                  class="mt-2"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  },
);

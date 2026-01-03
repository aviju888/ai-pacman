import React from 'react';

interface TrainingChartProps {
  data: { episode: number; totalReward: number; steps: number }[];
  title?: string;
}

export const TrainingChart: React.FC<TrainingChartProps> = ({
  data,
  title = 'Training Progress',
}) => {
  if (data.length === 0) return null;

  const maxReward = Math.max(...data.map((d) => d.totalReward));
  const minReward = Math.min(...data.map((d) => d.totalReward));
  const range = maxReward - minReward || 1;

  const height = 150;
  const width = 400;
  const padding = 30;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((d.totalReward - minReward) / range) * (height - 2 * padding);
    return { x, y, ...d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-300 mb-2">{title}</h4>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ maxHeight: '200px' }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            y1={height - padding - ratio * (height - 2 * padding)}
            x2={width - padding}
            y2={height - padding - ratio * (height - 2 * padding)}
            stroke="#374151"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#6B7280"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#6B7280"
          strokeWidth="2"
        />

        {/* Data line */}
        <path
          d={pathD}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          className="drop-shadow-lg"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#3B82F6"
            className="hover:r-5 transition-all cursor-pointer"
          >
            <title>Episode {p.episode}: Reward {p.totalReward.toFixed(2)}</title>
          </circle>
        ))}

        {/* Labels */}
        <text x={width / 2} y={height - 5} textAnchor="middle" className="text-xs fill-gray-400">
          Episode
        </text>
        <text
          x={10}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 10, ${height / 2})`}
          className="text-xs fill-gray-400"
        >
          Reward
        </text>

        {/* Min/Max labels */}
        <text x={padding - 5} y={padding + 5} textAnchor="end" className="text-xs fill-gray-500">
          {maxReward.toFixed(1)}
        </text>
        <text x={padding - 5} y={height - padding} textAnchor="end" className="text-xs fill-gray-500">
          {minReward.toFixed(1)}
        </text>
      </svg>
    </div>
  );
};

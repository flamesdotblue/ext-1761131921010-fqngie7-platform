import React, { useMemo } from 'react';

// Simple bubble map positioning for major regions
const regionPositions = {
  'North America': { x: 180, y: 120 },
  'EMEA': { x: 380, y: 120 },
  'APAC': { x: 590, y: 150 },
  'LATAM': { x: 220, y: 220 },
};

const divergingColor = (value, allValues) => {
  if (!allValues.length) return '#9CA3AF';
  const vals = allValues.slice().sort((a, b) => a - b);
  const q1 = vals[Math.floor(vals.length * 0.25)];
  const q3 = vals[Math.floor(vals.length * 0.75)];
  if (value >= q3) return '#059669'; // emerald-600
  if (value <= q1) return '#DC2626'; // red-600
  return '#9CA3AF'; // gray-400
};

const MapChart = ({ data }) => {
  const values = data.map(d => d.revenue);
  const maxVal = Math.max(1, ...values);

  const bubbles = useMemo(() => {
    return data.map(d => {
      const pos = regionPositions[d.region] || { x: 400, y: 180 };
      const r = 16 + (d.revenue / maxVal) * 28; // radius scaling
      const fill = divergingColor(d.revenue, values);
      return { ...d, ...pos, r, fill };
    });
  }, [data, maxVal, values]);

  return (
    <figure
      role="img"
      aria-label="Bubble map showing revenue by region with color indicating performance"
      className="w-full"
    >
      <svg viewBox="0 0 720 320" className="w-full h-[320px]">
        <title>Revenue by Region Bubble Map</title>
        <desc>Circle size indicates revenue magnitude; green is high performance, red is low, gray is neutral.</desc>
        <rect x="0" y="0" width="720" height="320" rx="12" className="fill-blue-50" />
        <g aria-hidden="true">
          <path d="M20,150 C120,20 240,40 340,100 C420,150 520,120 680,160" fill="none" stroke="#93C5FD" strokeWidth="2" opacity="0.4" />
          <path d="M40,210 C140,90 260,110 360,170 C440,220 540,190 700,210" fill="none" stroke="#93C5FD" strokeWidth="2" opacity="0.3" />
        </g>
        {bubbles.map(b => (
          <g key={b.region}>
            <circle
              cx={b.x}
              cy={b.y}
              r={b.r}
              fill={b.fill}
              fillOpacity="0.9"
              stroke="#111827"
              strokeOpacity="0.15"
            >
              <title>{`${b.region}: $${b.revenue.toLocaleString()}`}</title>
            </circle>
            <text x={b.x} y={b.y + b.r + 16} textAnchor="middle" className="fill-gray-800 text-xs">
              {b.region}
            </text>
          </g>
        ))}
        <g transform="translate(16,16)">
          <rect x="0" y="0" width="180" height="72" rx="8" className="fill-white" stroke="#E5E7EB" />
          <text x="12" y="20" className="fill-gray-700 text-xs">Legend</text>
          <g transform="translate(12,28)">
            <circle cx="8" cy="8" r="6" fill="#059669" />
            <text x="22" y="12" className="fill-gray-800 text-xs">High</text>
          </g>
          <g transform="translate(12,46)">
            <circle cx="8" cy="8" r="6" fill="#9CA3AF" />
            <text x="22" y="12" className="fill-gray-800 text-xs">Neutral</text>
          </g>
          <g transform="translate(96,28)">
            <circle cx="8" cy="8" r="6" fill="#DC2626" />
            <text x="22" y="12" className="fill-gray-800 text-xs">Low</text>
          </g>
        </g>
      </svg>
      <figcaption className="sr-only">Bubble map with four sales regions placed approximately on a world layout.</figcaption>
    </figure>
  );
};

export default MapChart;

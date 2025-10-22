import React, { useMemo, useState } from 'react';

const colors = {
  'North America': '#2563EB',
  'EMEA': '#0EA5E9',
  'APAC': '#7C3AED',
  'LATAM': '#059669',
};

const formatDate = (d) => d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });

const TimeSeries = ({ series, regions }) => {
  const [focused, setFocused] = useState('All');
  const [drillPoint, setDrillPoint] = useState(null);

  const displayedRegions = focused === 'All' ? regions : regions.filter(r => r === focused);

  const width = 960;
  const height = 320;
  const margin = { top: 16, right: 16, bottom: 36, left: 56 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const flat = series.filter(s => displayedRegions.includes(s.region));
  const xDates = Array.from(new Set(flat.map(d => d.date.getTime()))).map(t => new Date(t)).sort((a, b) => a - b);
  const yMax = Math.max(1, ...flat.map(d => d.mrr));

  const xScale = (date) => {
    const i = xDates.findIndex(d => d.getTime() === date.getTime());
    if (i < 0) return margin.left;
    const step = innerW / Math.max(1, xDates.length - 1);
    return margin.left + i * step;
  };
  const yScale = (val) => margin.top + innerH - (val / yMax) * innerH;

  const lines = useMemo(() => {
    const byRegion = new Map();
    flat.forEach(d => {
      if (!byRegion.has(d.region)) byRegion.set(d.region, []);
      byRegion.get(d.region).push(d);
    });
    byRegion.forEach(arr => arr.sort((a, b) => a.date - b.date));
    return Array.from(byRegion.entries());
  }, [flat]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3" role="group" aria-label="Region legend">
        <button
          className={`px-3 py-1.5 rounded-md border text-sm ${focused === 'All' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
          onClick={() => setFocused('All')}
          aria-pressed={focused === 'All'}
        >
          All Regions
        </button>
        {regions.map(r => (
          <button
            key={r}
            className={`px-3 py-1.5 rounded-md border text-sm`} 
            style={{
              background: focused === r ? colors[r] : 'white',
              color: focused === r ? 'white' : '#111827',
              borderColor: focused === r ? colors[r] : '#D1D5DB',
            }}
            onClick={() => setFocused(prev => prev === r ? 'All' : r)}
            aria-pressed={focused === r}
          >
            {r}
          </button>
        ))}
      </div>

      <figure role="img" aria-label="Line chart showing MRR over time by region" className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[320px]">
          <title>MRR Growth by Region</title>
          <desc>Interactive time series with legend to focus on a single region and points clickable for drill-down.</desc>
          <rect x="0" y="0" width={width} height={height} fill="#FFFFFF" />
          {/* Axes */}
          <g>
            {/* Y axis ticks */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
              const y = yScale(yMax * t);
              const val = Math.round(yMax * t);
              return (
                <g key={idx}>
                  <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke="#E5E7EB" />
                  <text x={margin.left - 8} y={y + 4} textAnchor="end" className="fill-gray-700 text-xs">${val.toLocaleString()}</text>
                </g>
              );
            })}
            {/* X axis labels */}
            {xDates.map((d, i) => (
              <g key={+d}>
                <text x={xScale(d)} y={height - 8} textAnchor="middle" className="fill-gray-700 text-xs">
                  {formatDate(d)}
                </text>
              </g>
            ))}
          </g>

          {/* Lines */}
          {lines.map(([region, arr]) => {
            const path = arr.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.date)} ${yScale(p.mrr)}`).join(' ');
            const color = colors[region] || '#3B82F6';
            const dimmed = focused !== 'All' && focused !== region;
            return (
              <g key={region} opacity={dimmed ? 0.25 : 1}>
                <path d={path} fill="none" stroke={color} strokeWidth="2.5" />
                {arr.map(pt => (
                  <g key={+pt.date}>
                    <circle
                      cx={xScale(pt.date)}
                      cy={yScale(pt.mrr)}
                      r={4}
                      fill={color}
                    >
                      <title>{`${region} — ${formatDate(pt.date)}: $${pt.mrr.toLocaleString()}`}</title>
                    </circle>
                    <rect
                      x={xScale(pt.date) - 8}
                      y={yScale(pt.mrr) - 8}
                      width={16}
                      height={16}
                      fill="transparent"
                      onClick={() => setDrillPoint({ region, date: pt.date, value: pt.mrr })}
                    />
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
        <figcaption className="sr-only">Line chart with monthly, quarterly, or annual aggregation.</figcaption>
      </figure>

      {drillPoint && (
        <div className="mt-3 rounded-lg border bg-blue-50 text-blue-900 p-3" role="status" aria-live="polite">
          <p className="text-sm font-medium">Drill-down</p>
          <p className="text-sm">{drillPoint.region} on {formatDate(drillPoint.date)} — MRR: ${drillPoint.value.toLocaleString()}</p>
          <p className="text-xs text-blue-900/80 mt-1">Tip: Adjust the Aggregation above to view quarterly or annual trends for this period.</p>
          <button
            className="mt-2 inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            onClick={() => setDrillPoint(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeSeries;

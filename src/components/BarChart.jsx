import React, { useMemo } from 'react';

const BarChart = ({ data }) => {
  const sorted = useMemo(() => data.slice().sort((a, b) => b.revenue - a.revenue), [data]);
  const maxVal = Math.max(1, ...sorted.map(d => d.revenue));

  return (
    <figure role="img" aria-label="Bar chart comparing revenue across regions" className="w-full">
      <div className="space-y-3">
        {sorted.map((d) => (
          <div key={d.region} className="flex items-center gap-3">
            <div className="w-28 text-sm text-gray-700">{d.region}</div>
            <div className="flex-1 bg-gray-100 rounded-md h-8 relative" aria-hidden="true">
              <div
                className="h-8 rounded-md bg-blue-600"
                style={{ width: `${(d.revenue / maxVal) * 100}%` }}
                title={`${d.region}: $${d.revenue.toLocaleString()}`}
              />
            </div>
            <div className="w-24 text-right text-sm tabular-nums text-gray-800">${d.revenue.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <figcaption className="sr-only">Bars are sorted from highest to lowest revenue.</figcaption>
    </figure>
  );
};

export default BarChart;

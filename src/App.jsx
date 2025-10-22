import React, { useMemo, useState } from 'react';
import Filters from './components/Filters';
import KPICards from './components/KPICards';
import MapChart from './components/MapChart';
import BarChart from './components/BarChart';
import TimeSeries from './components/TimeSeries';
import { generateMockData, filterData, aggregateSeries, computeKPIs } from './components/dataUtils';

const App = () => {
  const [filters, setFilters] = useState({
    region: 'All',
    product: 'All',
    segment: 'All',
    startDate: new Date(new Date().getFullYear() - 1, 0, 1),
    endDate: new Date(),
    granularity: 'Monthly',
  });

  const rawData = useMemo(() => generateMockData(), []);

  const filtered = useMemo(() => filterData(rawData, filters), [rawData, filters]);

  const aggregated = useMemo(() => aggregateSeries(filtered, filters.granularity), [filtered, filters.granularity]);

  const kpis = useMemo(() => computeKPIs(filtered), [filtered]);

  const regions = useMemo(() => Array.from(new Set(filtered.map(d => d.region))), [filtered]);

  const regionRevenue = useMemo(() => {
    const map = new Map();
    filtered.forEach(d => map.set(d.region, (map.get(d.region) || 0) + d.revenue));
    return Array.from(map.entries()).map(([region, revenue]) => ({ region, revenue }));
  }, [filtered]);

  const onFiltersChange = (newFilters) => setFilters(prev => ({ ...prev, ...newFilters }));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Regional Sales Performance Dashboard</h1>
          <span className="text-sm text-gray-500" aria-live="polite">Accessible, responsive, and interactive</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Filters filters={filters} onChange={onFiltersChange} />

        <KPICards kpis={kpis} />

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border p-4" aria-label="Sales map section">
            <h2 className="text-lg font-medium mb-2">Revenue by Region</h2>
            <p className="text-sm text-gray-600 mb-4">Bubble map sized and color-coded by total revenue for the selected period. Green indicates higher performance, red indicates lower, and gray indicates neutral.</p>
            <MapChart data={regionRevenue} />
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-4" aria-label="Bar chart section">
            <h2 className="text-lg font-medium mb-2">Regional Revenue Comparison</h2>
            <p className="text-sm text-gray-600 mb-4">Regions sorted by revenue (descending).</p>
            <BarChart data={regionRevenue} />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border p-4" aria-label="Time series section">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <h2 className="text-lg font-medium">MRR Growth by Region</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="granularity" className="text-sm text-gray-700">Aggregation:</label>
              <select
                id="granularity"
                className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.granularity}
                onChange={(e) => onFiltersChange({ granularity: e.target.value })}
                aria-label="Time aggregation granularity"
              >
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Annual</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">Use the legend to focus a region. Hover points for details. Click a point to drill into the selected aggregation period.</p>
          <TimeSeries series={aggregated} regions={regions} />
        </section>

        <footer className="py-6 text-center text-xs text-gray-500">
          Built with a clean color palette and accessible design. All charts include alternative text and meet WCAG color contrast guidance.
        </footer>
      </main>
    </div>
  );
};

export default App;

import React from 'react';

const regionsList = ['All', 'North America', 'EMEA', 'APAC', 'LATAM'];
const productsList = ['All', 'Core', 'Pro', 'Enterprise'];
const segmentsList = ['All', 'SMB', 'Mid-Market', 'Enterprise'];

const toInputValue = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Filters = ({ filters, onChange }) => {
  const handleDateChange = (key, value) => {
    const date = value ? new Date(value) : null;
    onChange({ [key]: date });
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border p-4" aria-label="Interactive filters">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="flex flex-col">
          <label htmlFor="region" className="text-sm font-medium text-gray-700">Region</label>
          <select
            id="region"
            className="mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.region}
            onChange={(e) => onChange({ region: e.target.value })}
            aria-label="Filter by region"
          >
            {regionsList.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="product" className="text-sm font-medium text-gray-700">Product</label>
          <select
            id="product"
            className="mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.product}
            onChange={(e) => onChange({ product: e.target.value })}
            aria-label="Filter by product"
          >
            {productsList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="segment" className="text-sm font-medium text-gray-700">Customer Segment</label>
          <select
            id="segment"
            className="mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.segment}
            onChange={(e) => onChange({ segment: e.target.value })}
            aria-label="Filter by customer segment"
          >
            {segmentsList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date</label>
          <input
            id="startDate"
            type="date"
            className="mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.startDate ? toInputValue(filters.startDate) : ''}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            aria-label="Select start date"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</label>
          <input
            id="endDate"
            type="date"
            className="mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.endDate ? toInputValue(filters.endDate) : ''}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            aria-label="Select end date"
          />
        </div>
      </div>
    </section>
  );
};

export default Filters;

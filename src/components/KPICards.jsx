import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const formatCurrency = (n) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const formatPct = (n) => `${(n * 100).toFixed(1)}%`;

const Stat = ({ label, value, delta, formatter = (v) => v }) => {
  const positive = delta >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  const trendColor = positive ? 'text-emerald-600' : 'text-rose-600';
  const bgColor = positive ? 'bg-emerald-50' : 'bg-rose-50';

  return (
    <div className="flex flex-col justify-between rounded-lg border shadow-sm bg-white p-4" role="group" aria-label={`${label} scorecard`}>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{formatter(value)}</p>
      </div>
      <div className={`mt-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ${bgColor} ${trendColor}`} aria-live="polite">
        <Icon className="w-4 h-4" aria-hidden="true" />
        <span className="font-medium">{positive ? 'Up' : 'Down'} {formatter(Math.abs(delta))}</span>
      </div>
    </div>
  );
};

const KPICards = ({ kpis }) => {
  return (
    <section aria-label="Key performance indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat label="Monthly Recurring Revenue" value={kpis.mrr} delta={kpis.mrrDelta} formatter={formatCurrency} />
      <Stat label="Customer Acquisition Cost" value={kpis.cac} delta={kpis.cacDelta} formatter={formatCurrency} />
      <Stat label="Customer Lifetime Value" value={kpis.cltv} delta={kpis.cltvDelta} formatter={formatCurrency} />
      <Stat label="Churn Rate" value={kpis.churnRate} delta={kpis.churnDelta} formatter={formatPct} />
    </section>
  );
};

export default KPICards;

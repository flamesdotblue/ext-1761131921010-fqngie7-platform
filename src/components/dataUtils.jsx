// Data utilities to generate mock SaaS metrics and filter/aggregate them

const regions = ['North America', 'EMEA', 'APAC', 'LATAM'];
const products = ['Core', 'Pro', 'Enterprise'];
const segments = ['SMB', 'Mid-Market', 'Enterprise'];

const monthDiff = (a, b) => (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());

export function generateMockData() {
  const end = new Date();
  const start = new Date(end.getFullYear() - 1, end.getMonth() - 12, 1);
  const months = monthDiff(start, end) + 1;
  const out = [];

  for (let m = 0; m < months; m++) {
    const date = new Date(start.getFullYear(), start.getMonth() + m, 1);
    regions.forEach(region => {
      products.forEach(product => {
        segments.forEach(segment => {
          // Baselines per region
          const base = {
            'North America': 180000,
            'EMEA': 140000,
            'APAC': 120000,
            'LATAM': 60000,
          }[region];
          const prodMult = { Core: 1.0, Pro: 1.4, Enterprise: 1.9 }[product];
          const segMult = { SMB: 0.6, 'Mid-Market': 1.0, Enterprise: 1.5 }[segment];
          const seasonal = 1 + 0.1 * Math.sin((m / 12) * Math.PI * 2);
          const noise = 0.85 + Math.random() * 0.3;

          const mrr = Math.round((base * prodMult * segMult * seasonal * noise) / 10);
          const revenue = mrr; // simplify: treat as revenue for this mock
          const cac = Math.round(250 + (800 * (1 / prodMult)) * (1 + Math.random() * 0.2));
          const cltv = Math.round(2000 * prodMult * (1.2 + Math.random() * 0.4));
          const churnRate = Math.min(0.25, Math.max(0.01, 0.07 - 0.01 * Math.sin(m / 3) + (Math.random() - 0.5) * 0.02));

          out.push({ date, region, product, segment, mrr, revenue, cac, cltv, churnRate });
        });
      });
    });
  }
  return out;
}

export function filterData(data, filters) {
  const { region, product, segment, startDate, endDate } = filters;
  return data.filter(d => {
    if (region !== 'All' && d.region !== region) return false;
    if (product !== 'All' && d.product !== product) return false;
    if (segment !== 'All' && d.segment !== segment) return false;
    if (startDate && d.date < startDate) return false;
    if (endDate && d.date > endDate) return false;
    return true;
  });
}

function toPeriod(date, granularity) {
  const y = date.getFullYear();
  if (granularity === 'Annual') return new Date(y, 0, 1);
  if (granularity === 'Quarterly') {
    const qStartMonth = Math.floor(date.getMonth() / 3) * 3;
    return new Date(y, qStartMonth, 1);
  }
  return new Date(y, date.getMonth(), 1);
}

export function aggregateSeries(filtered, granularity) {
  // Aggregate per region per period
  const map = new Map();
  filtered.forEach(d => {
    const key = `${d.region}|${toPeriod(d.date, granularity).toISOString()}`;
    if (!map.has(key)) map.set(key, { date: toPeriod(d.date, granularity), region: d.region, mrr: 0 });
    map.get(key).mrr += d.mrr;
  });
  return Array.from(map.values()).sort((a, b) => a.date - b.date);
}

export function computeKPIs(filtered) {
  if (filtered.length === 0) return { mrr: 0, mrrDelta: 0, cac: 0, cacDelta: 0, cltv: 0, cltvDelta: 0, churnRate: 0, churnDelta: 0 };

  // Latest period and previous period comparisons
  const byMonth = new Map();
  filtered.forEach(d => {
    const k = new Date(d.date.getFullYear(), d.date.getMonth(), 1).toISOString();
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k).push(d);
  });
  const periods = Array.from(byMonth.keys()).sort();
  const latest = periods[periods.length - 1];
  const prev = periods[periods.length - 2] || latest;

  const sum = (arr, key) => arr.reduce((acc, x) => acc + x[key], 0);
  const avg = (arr, key) => arr.reduce((acc, x) => acc + x[key], 0) / (arr.length || 1);

  const latestArr = byMonth.get(latest) || [];
  const prevArr = byMonth.get(prev) || [];

  const mrr = sum(latestArr, 'mrr');
  const mrrPrev = sum(prevArr, 'mrr');
  const cac = avg(latestArr, 'cac');
  const cacPrev = avg(prevArr, 'cac');
  const cltv = avg(latestArr, 'cltv');
  const cltvPrev = avg(prevArr, 'cltv');
  const churn = avg(latestArr, 'churnRate');
  const churnPrev = avg(prevArr, 'churnRate');

  return {
    mrr,
    mrrDelta: mrrPrev ? (mrr - mrrPrev) : 0,
    cac: Math.round(cac),
    cacDelta: Math.round(cac - cacPrev),
    cltv: Math.round(cltv),
    cltvDelta: Math.round(cltv - cltvPrev),
    churnRate: churn,
    churnDelta: churn - churnPrev,
  };
}

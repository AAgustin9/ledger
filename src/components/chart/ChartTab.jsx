import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MONTHS } from '../../constants/app';
import { fmt } from '../../utils/ledger';
import Divider from '../ui/Divider';
import EmptyState from '../ui/EmptyState';
import SectionHeader from '../ui/SectionHeader';
import StatPill from '../ui/StatPill';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const things = payload.find((p) => p.dataKey === 'things')?.value ?? 0;
  const food = payload.find((p) => p.dataKey === 'food')?.value ?? 0;
  const total = things + food;
  return (
    <div style={{
      background: 'var(--color-card)', border: '1px solid var(--color-border)',
      borderRadius: 3, fontFamily: 'var(--font-mono)', fontSize: 13, padding: '8px 12px',
      minWidth: 160,
    }}>
      <div style={{ color: 'var(--color-accent)', letterSpacing: '1px', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: 'var(--color-text-dim)' }}>Things</span>
          <span style={{ color: 'var(--color-accent-dim)' }}>{fmt(things)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: 'var(--color-text-dim)' }}>Food</span>
          <span style={{ color: 'var(--color-accent)' }}>{fmt(food)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderTop: '1px solid var(--color-border)', marginTop: 3, paddingTop: 4 }}>
          <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>Total</span>
          <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

export default function ChartTab({ things, foodOrders }) {
  const data = useMemo(
    () =>
      MONTHS.map((month) => {
        const thingsAmount = things
          .filter((item) => item.month === month)
          .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

        const foodAmount = foodOrders.reduce((sum, order) => {
          if (MONTHS[new Date(`${order.date}T00:00:00`).getMonth()] !== month) {
            return sum;
          }

          return sum + parseFloat(order.myFoodCost || 0);
        }, 0);

        return {
          month,
          things: thingsAmount,
          food: foodAmount,
          total: thingsAmount + foodAmount,
        };
      }),
    [things, foodOrders]
  );

  const hasData = data.some((item) => item.total > 0);

  const stats = useMemo(() => {
    const allThings = things.map((item) => ({
      label: item.title,
      amount: parseFloat(item.amount || 0),
    }));
    const biggestPurchase =
      allThings.length > 0
        ? allThings.reduce((current, next) => (current.amount > next.amount ? current : next))
        : null;
    const highestMonth = data.reduce(
      (current, next) => (next.total > current.total ? next : current),
      { month: null, total: 0 }
    );
    const averageOrder =
      foodOrders.length > 0
        ? foodOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0) /
          foodOrders.length
        : 0;

    return { biggestPurchase, highestMonth, averageOrder };
  }, [things, foodOrders, data]);

  return (
    <section className="fade-in">
      <SectionHeader title="Monthly Chart" badge="spending by month" />

      {hasData ? (
        <div className="chart-panel">
          <div className="chart-canvas">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={18}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--color-text-dim)', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-dim)', fontSize: 12, fontFamily: 'var(--font-mono)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                  width={52}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="things" name="Things" stackId="a" fill="var(--color-accent-dim)" />
                <Bar dataKey="food" name="Food" stackId="a" fill="var(--color-accent)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            {[
              { color: 'var(--color-accent-dim)', label: 'Things' },
              { color: 'var(--color-accent)', label: 'Food (mine)' },
            ].map((item) => (
              <div key={item.label} className="chart-legend-item">
                <div className="chart-legend-swatch" style={{ background: item.color }} />
                <span className="chart-legend-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState text="Add purchases or food orders to see the chart." />
      )}

      <Divider label="Quick Stats" />
      <div className="stats-grid">
        {stats.biggestPurchase ? (
          <StatPill
            label="Biggest Purchase"
            value={`${stats.biggestPurchase.label} — ${fmt(stats.biggestPurchase.amount)}`}
          />
        ) : null}
        {stats.highestMonth.month && stats.highestMonth.total > 0 ? (
          <StatPill
            label="Highest Spend Month"
            value={`${stats.highestMonth.month} — ${fmt(stats.highestMonth.total)}`}
          />
        ) : null}
        {stats.averageOrder > 0 ? <StatPill label="Avg Food Order" value={fmt(stats.averageOrder)} /> : null}
        {!stats.biggestPurchase && !stats.averageOrder ? (
          <div className="chart-empty-note">No data yet.</div>
        ) : null}
      </div>
    </section>
  );
}

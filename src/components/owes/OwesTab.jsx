import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Users, Utensils } from 'lucide-react';
import { fmt } from '../../utils/ledger';
import EmptyState from '../ui/EmptyState';
import SectionHeader from '../ui/SectionHeader';

export default function OwesTab({ things, foodOrders }) {
  const [expandedNames, setExpandedNames] = useState(new Set());

  const debtors = useMemo(() => {
    const map = {};

    const get = (rawName) => {
      const key = rawName.trim().toLowerCase();
      if (!map[key]) {
        map[key] = { displayName: rawName.trim(), total: 0, paid: 0, outstanding: 0, items: [] };
      }
      return map[key];
    };

    things.forEach((thing) => {
      if (!thing.groupBuy || !thing.participants?.length) return;
      const share = parseFloat(thing.amount || 0) / (thing.participants.length + 1);
      thing.participants.forEach((p) => {
        const d = get(p.name);
        d.total += share;
        if (p.paid) d.paid += share;
        else d.outstanding += share;
        d.items.push({ type: 'thing', label: thing.title, amount: share, paid: p.paid, month: thing.month, day: thing.day });
      });
    });

    foodOrders.forEach((order) => {
      const participants = order.participants || [];
      if (!participants.length) return;
      const fee = parseFloat(order.deliveryFee || 0);
      const iOrdered = parseFloat(order.myFoodCost || 0) > 0;
      const split = participants.length + (iOrdered ? 1 : 0);
      const payerName = order.paidBy?.name?.trim().toLowerCase();

      participants.forEach((p) => {
        const isPayer = payerName && p.name.trim().toLowerCase() === payerName;
        if (isPayer) return;
        const owes = parseFloat(p.foodCost || 0) + (split > 0 ? fee / split : 0);
        if (owes <= 0) return;
        const d = get(p.name);
        d.total += owes;
        if (p.paid) d.paid += owes;
        else d.outstanding += owes;
        d.items.push({ type: 'food', label: order.title || 'Food order', amount: owes, paid: p.paid, month: order.month, day: order.day });
      });
    });

    return Object.values(map).sort((a, b) => b.outstanding - a.outstanding || b.total - a.total);
  }, [things, foodOrders]);

  const totalOutstanding = debtors.reduce((s, d) => s + d.outstanding, 0);

  const toggleExpand = (name) => {
    setExpandedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <section className="fade-in">
      <SectionHeader title="Owes" badge={`${debtors.length} people`} total={totalOutstanding} />

      {debtors.length === 0 ? (
        <EmptyState text="No debtors yet." />
      ) : (
        <div className="stack-list">
          {debtors.map((d) => {
            const key = d.displayName.toLowerCase();
            const isExpanded = expandedNames.has(key);
            const allSettled = d.outstanding <= 0 && d.total > 0;

            return (
              <div key={key} className="month-card">
                <div
                  className="month-card-header"
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleExpand(key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <span className="month-card-title">{d.displayName}</span>
                    {allSettled ? (
                      <span className="positive-text" style={{ fontSize: 11 }}>✓ settled</span>
                    ) : d.outstanding > 0 ? (
                      <span className="accent-text" style={{ fontSize: 11, fontFamily: "'Courier New', monospace" }}>
                        {fmt(d.outstanding)} outstanding
                      </span>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="mono month-card-total">{fmt(d.total)}</span>
                    <span className="muted-text">
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="fade-in" style={{ padding: '0 0 10px' }}>
                    {d.paid > 0 && (
                      <div style={{ padding: '4px 16px 8px', fontSize: 12, color: 'var(--color-text-dim)', display: 'flex', gap: 16 }}>
                        <span>Paid: <span className="mono positive-text">{fmt(d.paid)}</span></span>
                        {d.outstanding > 0 && <span>Outstanding: <span className="mono accent-text">{fmt(d.outstanding)}</span></span>}
                      </div>
                    )}
                    {d.items.map((item, i) => (
                      <div
                        key={i}
                        className="row-item month-row"
                        style={{ borderTop: i === 0 ? '1px solid var(--color-border)' : '1px solid var(--color-border)', opacity: item.paid ? 0.5 : 1 }}
                      >
                        <span style={{ color: 'var(--color-text-dim)', display: 'flex', alignItems: 'center' }}>
                          {item.type === 'food' ? <Utensils size={12} /> : <Users size={12} />}
                        </span>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--color-text-dim)', minWidth: 48 }}>
                          {item.month && item.day ? `${item.month} ${item.day}` : item.month || ''}
                        </span>
                        <span className="row-title" style={{ textDecoration: item.paid ? 'line-through' : 'none' }}>
                          {item.label}
                        </span>
                        <span className="mono month-row-amount" style={{ color: item.paid ? 'var(--color-text-dim)' : 'var(--color-accent)' }}>
                          {fmt(item.amount)}
                        </span>
                        {item.paid && (
                          <span className="positive-text" style={{ fontSize: 11 }}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

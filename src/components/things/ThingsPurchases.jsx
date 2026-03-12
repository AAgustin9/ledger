import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { MONTHS, YEAR } from '../../constants/app';
import { fmt, today, uid } from '../../utils/ledger';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import Input from '../ui/Input';
import SectionHeader from '../ui/SectionHeader';
import Select from '../ui/Select';

export default function ThingsPurchases({ things, setThings }) {
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [day, setDay] = useState(String(new Date().getDate()));
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const total = useMemo(
    () => things.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0),
    [things]
  );

  const byMonth = useMemo(() => {
    const groups = Object.fromEntries(MONTHS.map((item) => [item, []]));
    things.forEach((thing) => {
      if (groups[thing.month]) {
        groups[thing.month].push(thing);
      }
    });
    return groups;
  }, [things]);

  const activeMonths = [...MONTHS].reverse().filter((item) => byMonth[item].length > 0);

  const addThing = () => {
    if (!title.trim() || !amount) {
      return;
    }

    setThings((current) => [
      ...current,
      {
        id: uid(),
        month,
        year: YEAR,
        day: day.trim() || String(new Date().getDate()),
        title: title.trim(),
        amount: parseFloat(amount),
        date: today(),
      },
    ]);
    setTitle('');
    setAmount('');
    setDay(String(new Date().getDate()));
  };

  return (
    <section className="fade-in">
      <SectionHeader title="Things" badge={`${things.length} purchases`} total={total} />

      <div className="form-row">
        <Select value={month} onChange={(event) => setMonth(event.target.value)} style={{ width: 90 }}>
          {MONTHS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Input
          type="number"
          placeholder="Day"
          value={day}
          min={1}
          max={31}
          onChange={(event) => setDay(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && addThing()}
          style={{ width: 72 }}
        />
        <Input
          className="flex-2"
          placeholder="What did you buy?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && addThing()}
        />
        <Input
          className="flex-1"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && addThing()}
        />
        <Button onClick={addThing}>
          <Plus size={15} />
          Add
        </Button>
      </div>

      {things.length === 0 ? (
        <EmptyState text="No purchases yet." />
      ) : (
        <div className="stack-list">
          {activeMonths.map((item) => {
            const entries = byMonth[item];
            const subtotal = entries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

            return (
              <div key={item} className="month-card">
                <div className="month-card-header">
                  <span className="month-card-title">
                    {item} {YEAR}
                  </span>
                  <span className="mono month-card-total">{fmt(subtotal)}</span>
                </div>
                {[...entries].sort((a, b) => parseInt(b.day || 0) - parseInt(a.day || 0)).map((entry, index) => (
                  <div
                    key={entry.id}
                    className="row-item fade-in month-row"
                    style={{ borderTop: index > 0 ? '1px solid var(--color-border)' : 'none' }}
                  >
                    {entry.day ? (
                      <span className="mono" style={{ fontSize: 13, color: 'var(--color-text-dim)', minWidth: 28 }}>
                        {entry.day}
                      </span>
                    ) : null}
                    <span className="row-title">{entry.title}</span>
                    <span className="mono month-row-amount">{fmt(entry.amount)}</span>
                    <div className="row-action">
                      <button
                        className="del-btn press icon-button danger-text"
                        onClick={() => setThings((current) => current.filter((thing) => thing.id !== entry.id))}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import Input from '../ui/Input';
import SectionHeader from '../ui/SectionHeader';
import TableHead from '../ui/TableHead';
import { fmt, today, uid } from '../../utils/ledger';

export default function IncomeTracker({ income, setIncome }) {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');

  const total = useMemo(
    () => income.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0),
    [income]
  );

  const addIncome = () => {
    if (!source.trim() || !amount) {
      return;
    }

    setIncome((current) => [
      ...current,
      { id: uid(), source: source.trim(), amount: parseFloat(amount), date: today() },
    ]);
    setSource('');
    setAmount('');
  };

  return (
    <section className="fade-in">
      <SectionHeader title="Income" badge={`${income.length} entries`} total={total} />

      <div className="form-row">
        <Input
          className="flex-2"
          placeholder="Source — e.g. Freelance, Salary"
          value={source}
          onChange={(event) => setSource(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && addIncome()}
        />
        <Input
          className="flex-1"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && addIncome()}
        />
        <Button onClick={addIncome}>
          <Plus size={15} />
          Add
        </Button>
      </div>

      {income.length === 0 ? (
        <EmptyState text="No income entries yet." />
      ) : (
        <div className="table-shell">
          <TableHead cols={['Date', 'Source', 'Amount', '']} widths={['130px', '1fr', '140px', '42px']} />
          {income.map((item, index) => (
            <div
              key={item.id}
              className="row-item fade-in table-row"
              style={{
                gridTemplateColumns: '130px 1fr 140px 42px',
                borderTop: index > 0 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <span className="mono row-date">{item.date}</span>
              <span className="row-title">{item.source}</span>
              <span className="mono row-amount positive-text">+{fmt(item.amount)}</span>
              <div className="row-action">
                <button
                  className="del-btn press icon-button danger-text"
                  onClick={() => setIncome((current) => current.filter((entry) => entry.id !== item.id))}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          <div className="table-total-row" style={{ gridTemplateColumns: '130px 1fr 140px 42px' }}>
            <div />
            <span className="table-total-label">Total</span>
            <span className="mono table-total-value">{fmt(total)}</span>
          </div>
        </div>
      )}
    </section>
  );
}

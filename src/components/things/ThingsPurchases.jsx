import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Users } from 'lucide-react';
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
  const [isGroupBuy, setIsGroupBuy] = useState(false);
  const [formParticipants, setFormParticipants] = useState([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [expandedInputs, setExpandedInputs] = useState({});

  const total = useMemo(
    () =>
      things.reduce((sum, item) => {
        const amt = parseFloat(item.amount || 0);
        if (item.groupBuy && item.participants?.length > 0) {
          return sum + amt / (item.participants.length + 1);
        }
        return sum + amt;
      }, 0),
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

  const addFormParticipant = () => {
    if (!newParticipantName.trim()) return;
    setFormParticipants((current) => [
      ...current,
      { id: uid(), name: newParticipantName.trim(), paid: false },
    ]);
    setNewParticipantName('');
  };

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
        ...(isGroupBuy && formParticipants.length > 0
          ? { groupBuy: true, participants: formParticipants }
          : {}),
      },
    ]);
    setTitle('');
    setAmount('');
    setDay(String(new Date().getDate()));
    setIsGroupBuy(false);
    setFormParticipants([]);
    setNewParticipantName('');
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addParticipantToThing = (thingId) => {
    const name = (expandedInputs[thingId] || '').trim();
    if (!name) return;
    setThings((current) =>
      current.map((t) =>
        t.id === thingId
          ? { ...t, participants: [...(t.participants || []), { id: uid(), name, paid: false }] }
          : t
      )
    );
    setExpandedInputs((prev) => ({ ...prev, [thingId]: '' }));
  };

  const removeParticipantFromThing = (thingId, participantId) => {
    setThings((current) =>
      current.map((t) =>
        t.id === thingId
          ? { ...t, participants: (t.participants || []).filter((p) => p.id !== participantId) }
          : t
      )
    );
  };

  const toggleParticipantPaid = (thingId, participantId) => {
    setThings((current) =>
      current.map((t) =>
        t.id === thingId
          ? {
              ...t,
              participants: t.participants.map((p) =>
                p.id === participantId ? { ...p, paid: !p.paid } : p
              ),
            }
          : t
      )
    );
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

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 8,
          marginBottom: isGroupBuy ? 8 : 0,
        }}
      >
        <input
          type="checkbox"
          checked={isGroupBuy}
          onChange={(e) => {
            setIsGroupBuy(e.target.checked);
            if (!e.target.checked) {
              setFormParticipants([]);
              setNewParticipantName('');
            }
          }}
          style={{ cursor: 'pointer' }}
        />
        <span className="field-label">Group buy (I paid, split with others)</span>
      </label>

      {isGroupBuy && (
        <div className="fade-in" style={{ marginBottom: 12 }}>
          {formParticipants.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {formParticipants.map((p) => (
                <div
                  key={p.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}
                >
                  <Users size={13} style={{ color: 'var(--color-text-dim)' }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                  {amount && (
                    <span className="mono" style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>
                      {fmt(parseFloat(amount) / (formParticipants.length + 1))}
                    </span>
                  )}
                  <button
                    className="press icon-button muted-text"
                    onClick={() =>
                      setFormParticipants((curr) => curr.filter((x) => x.id !== p.id))
                    }
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {amount && (
                <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginTop: 4 }}>
                  Your share: {fmt(parseFloat(amount) / (formParticipants.length + 1))} · ÷
                  {formParticipants.length + 1} ways
                </div>
              )}
            </div>
          )}
          <div className="form-row">
            <Input
              className="flex-1"
              placeholder="Add participant…"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFormParticipant()}
            />
            <Button onClick={addFormParticipant} variant="ghost">
              <Plus size={15} />
              Add
            </Button>
          </div>
        </div>
      )}

      {things.length === 0 ? (
        <EmptyState text="No purchases yet." />
      ) : (
        <div className="stack-list">
          {activeMonths.map((item) => {
            const entries = byMonth[item];
            const subtotal = entries.reduce((sum, entry) => {
              const amt = parseFloat(entry.amount || 0);
              if (entry.groupBuy && entry.participants?.length > 0) {
                return sum + amt / (entry.participants.length + 1);
              }
              return sum + amt;
            }, 0);

            return (
              <div key={item} className="month-card">
                <div className="month-card-header">
                  <span className="month-card-title">
                    {item} {YEAR}
                  </span>
                  <span className="mono month-card-total">{fmt(subtotal)}</span>
                </div>
                {[...entries]
                  .sort((a, b) => parseInt(b.day || 0) - parseInt(a.day || 0))
                  .map((entry, index) => {
                    const isGroupBuyEntry = entry.groupBuy && entry.participants?.length > 0;
                    const split = isGroupBuyEntry ? entry.participants.length + 1 : 1;
                    const myShare = parseFloat(entry.amount || 0) / split;
                    const isExpanded = expandedIds.has(entry.id);
                    const unpaidParticipants = isGroupBuyEntry
                      ? entry.participants.filter((p) => !p.paid)
                      : [];

                    return (
                      <div
                        key={entry.id}
                        className="fade-in"
                        style={{
                          borderTop: index > 0 ? '1px solid var(--color-border)' : 'none',
                        }}
                      >
                        <div className="row-item month-row">
                          <span
                            className="mono"
                            style={{ fontSize: 13, color: 'var(--color-text-dim)' }}
                          >
                            {entry.day || ''}
                          </span>
                          <span className="row-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {entry.title}
                            {isGroupBuyEntry && (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: 'var(--color-text-dim)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  flexShrink: 0,
                                }}
                              >
                                <Users size={11} />
                                ÷{split}
                              </span>
                            )}
                          </span>
                          <span className="mono month-row-amount">
                            {fmt(isGroupBuyEntry ? myShare : entry.amount)}
                          </span>
                          <div className="row-action" style={{ display: 'flex', gap: 4 }}>
                            {isGroupBuyEntry && (
                              <button
                                className="press icon-button muted-text"
                                onClick={() => toggleExpand(entry.id)}
                              >
                                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                              </button>
                            )}
                            <button
                              className="del-btn press icon-button danger-text"
                              onClick={() =>
                                setThings((current) =>
                                  current.filter((thing) => thing.id !== entry.id)
                                )
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {isGroupBuyEntry && isExpanded && (
                          <div
                            className="fade-in"
                            style={{
                              padding: '8px 12px 12px',
                              background: 'rgba(0,0,0,0.02)',
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                color: 'var(--color-text-dim)',
                                marginBottom: 8,
                              }}
                            >
                              Total: {fmt(entry.amount)} · ÷{split} = {fmt(myShare)} each
                            </div>
                            {entry.participants.map((p) => (
                              <div
                                key={p.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  padding: '4px 0',
                                }}
                              >
                                <Users size={12} style={{ color: 'var(--color-text-dim)' }} />
                                <span
                                  style={{
                                    flex: 1,
                                    fontSize: 13,
                                    color: p.paid ? 'var(--color-text-dim)' : 'inherit',
                                    textDecoration: p.paid ? 'line-through' : 'none',
                                  }}
                                >
                                  {p.name}
                                </span>
                                <span
                                  className="mono"
                                  style={{ fontSize: 12, color: 'var(--color-text-dim)' }}
                                >
                                  {fmt(myShare)}
                                </span>
                                <button
                                  className={`status-toggle ${p.paid ? 'paid' : 'unpaid'}`}
                                  onClick={() => toggleParticipantPaid(entry.id, p.id)}
                                >
                                  {p.paid ? '✓ paid' : 'unpaid'}
                                </button>
                                <button
                                  className="press icon-button muted-text"
                                  onClick={() => removeParticipantFromThing(entry.id, p.id)}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                            {unpaidParticipants.length === 0 && entry.participants.length > 0 && (
                              <div
                                style={{ fontSize: 12, marginTop: 4 }}
                                className="positive-text"
                              >
                                ✓ all settled
                              </div>
                            )}
                            <div className="form-row" style={{ marginTop: 8 }}>
                              <Input
                                className="flex-1"
                                placeholder="Add participant…"
                                value={expandedInputs[entry.id] || ''}
                                onChange={(e) =>
                                  setExpandedInputs((prev) => ({
                                    ...prev,
                                    [entry.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) =>
                                  e.key === 'Enter' && addParticipantToThing(entry.id)
                                }
                              />
                              <Button
                                onClick={() => addParticipantToThing(entry.id)}
                                variant="ghost"
                              >
                                <Plus size={15} />
                                Add
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

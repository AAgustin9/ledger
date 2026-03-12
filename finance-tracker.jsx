 import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Plus, Trash2, ChevronDown, ChevronUp, Copy, Check,
  TrendingUp, ShoppingBag, Utensils, Users,
} from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEAR = new Date().getFullYear();

// ─── Theme ─────────────────────────────────────────────────────────────────────
const T = {
  bg:         '#0c0c0a',
  card:       '#141412',
  cardHover:  '#1c1c19',
  border:     '#272522',
  borderLight:'#353330',
  accent:     '#c9a84c',
  accentDim:  '#7a6428',
  accentBg:   'rgba(201,168,76,0.07)',
  text:       '#e8e0d0',
  textMuted:  '#8a8070',
  textDim:    '#504840',
  red:        '#c0392b',
  redBg:      'rgba(192,57,43,0.10)',
  green:      '#4a9e6a',
  greenBg:    'rgba(74,158,106,0.10)',
};

// ─── Utilities ─────────────────────────────────────────────────────────────────
const uid   = () => Math.random().toString(36).slice(2, 9);
const fmt   = (n) => `$${parseFloat(n || 0).toFixed(2)}`;
const today = () => new Date().toISOString().split('T')[0];
const daysSince = (d) => Math.floor((Date.now() - new Date(d)) / 86400000);

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

// ─── Global CSS ─────────────────────────────────────────────────────────────────
function GlobalStyle() {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; font-size: 16px; }
      body { background: ${T.bg}; color: ${T.text}; font-family: 'Georgia', 'Times New Roman', serif; -webkit-font-smoothing: antialiased; }
      .mono { font-family: 'Courier New', Courier, monospace !important; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: ${T.bg}; }
      ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
      input::placeholder, textarea::placeholder { color: ${T.textDim}; }
      input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
      @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
      .fade-in { animation: fadeIn 0.18s ease-out; }
      .row-item { transition: background 0.12s; }
      .row-item:hover { background: rgba(255,255,255,0.025) !important; }
      .row-item:hover .del-btn { opacity: 1 !important; }
      .del-btn { opacity: 0; transition: opacity 0.12s; }
      .press:hover { opacity: 0.75; }
      .press:active { transform: scale(0.97); }
      .tab-btn { transition: color 0.12s, border-color 0.12s, background 0.12s; }
    `}</style>
  );
}

// ─── Primitives ─────────────────────────────────────────────────────────────────
function Input({ style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      style={{
        background: T.bg,
        border: `1px solid ${focused ? T.accent : T.border}`,
        borderRadius: 3,
        color: T.text,
        padding: '10px 14px',
        fontSize: 15,
        outline: 'none',
        width: '100%',
        fontFamily: "'Courier New', monospace",
        transition: 'border-color 0.15s',
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

function Sel({ style, children, ...props }) {
  return (
    <select
      style={{
        background: T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: 3,
        color: T.text,
        padding: '10px 14px',
        fontSize: 15,
        outline: 'none',
        cursor: 'pointer',
        fontFamily: "'Courier New', monospace",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  );
}

function Btn({ children, variant = 'primary', style, ...props }) {
  const base = {
    border: 'none', borderRadius: 3, padding: '10px 18px', fontSize: 13,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: "'Courier New', monospace", letterSpacing: '0.5px',
    transition: 'opacity 0.12s, transform 0.1s', fontWeight: 600,
  };
  const v = {
    primary: { background: T.accent,       color: '#0c0c0a', fontWeight: 800 },
    ghost:   { background: 'transparent',  color: T.textMuted, border: `1px solid ${T.border}` },
    danger:  { background: T.redBg,        color: T.red,  border: `1px solid ${T.red}` },
  };
  return (
    <button className="press" style={{ ...base, ...v[variant], ...style }} {...props}>
      {children}
    </button>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 22px' }}>
      {label && <span style={{ fontSize: 12, color: T.textDim, letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap', fontWeight: 600 }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ padding: '52px 0', textAlign: 'center', color: T.textDim, fontSize: 15, fontStyle: 'italic' }}>
      {text}
    </div>
  );
}

function THead({ cols, widths }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: widths.join(' '),
      padding: '9px 16px', background: T.card, borderBottom: `1px solid ${T.border}`,
    }}>
      {cols.map((c, i) => (
        <span key={i} style={{
          fontSize: 11, color: T.textDim, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700,
          textAlign: i >= cols.length - 2 ? 'right' : 'left',
        }}>
          {c}
        </span>
      ))}
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────────
function SectionHeader({ title, badge, total, totalLabel = 'total' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
      <h2 style={{ fontSize: 30, fontWeight: 600, color: T.text, letterSpacing: '-0.5px' }}>{title}</h2>
      {badge && <span style={{ fontSize: 13, color: T.textDim }}>{badge}</span>}
      <div style={{ flex: 1, height: 1, background: T.border }} />
      {total !== undefined && (
        <span className="mono" style={{ fontSize: 15, color: T.accent, fontWeight: 700 }}>{fmt(total)} {totalLabel}</span>
      )}
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────────
function Dashboard({ income, things, foodOrders }) {
  const totalIncome = useMemo(() => income.reduce((s, i) => s + parseFloat(i.amount || 0), 0), [income]);
  const totalThings = useMemo(() => things.reduce((s, t) => s + parseFloat(t.amount || 0), 0), [things]);

  const { myFood, othersOwed, collected } = useMemo(() => {
    let myFood = 0, othersOwed = 0, collected = 0;
    foodOrders.forEach(order => {
      myFood += parseFloat(order.myFoodCost || 0);
      const fee   = parseFloat(order.deliveryFee || 0);
      const parts = order.participants || [];
      const split = parts.length + 1;
      parts.forEach(p => {
        const owes = parseFloat(p.foodCost || 0) + fee / split;
        if (p.paid) collected += owes;
        else        othersOwed += owes;
      });
    });
    return { myFood, othersOwed, collected };
  }, [foodOrders]);

  const balance    = totalIncome - totalThings - myFood + collected;
  const spent      = totalThings + myFood;
  const ratio      = totalIncome > 0 ? Math.min(spent / totalIncome, 1) : 0;
  const ratioColor = ratio > 0.85 ? T.red : ratio > 0.6 ? T.accent : T.green;

  return (
    <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <span style={{ fontSize: 12, color: T.textDim, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700 }}>Financial Summary</span>
        <div style={{ flex: 1, height: 1, background: T.border }} />
        <span className="mono" style={{ fontSize: 12, color: T.textDim }}>{YEAR}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Income',      value: totalIncome, icon: TrendingUp,  color: T.green },
          { label: 'Things',      value: totalThings, icon: ShoppingBag, color: T.textMuted },
          { label: 'Food (mine)', value: myFood,      icon: Utensils,    color: T.textMuted },
          { label: 'Owed to You', value: othersOwed,  icon: Users,       color: othersOwed > 0 ? T.accent : T.green },
          { label: 'Net Balance', value: balance, color: balance >= 0 ? T.green : T.red, big: true,
            sub: collected > 0 ? `+${fmt(collected)} collected` : null },
        ].map(({ label, value, icon: Icon, color, big, sub }) => (
          <div key={label} style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 4,
            padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: T.textDim, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>
              {Icon && <Icon size={13} />}{label}
            </div>
            <div className="mono" style={{ fontSize: big ? 32 : 26, fontWeight: 800, color, letterSpacing: '-1px', lineHeight: 1.1 }}>
              {fmt(value)}
            </div>
            {sub && <div style={{ fontSize: 13, color: T.textDim }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ fontSize: 12, color: T.textDim, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>Spending Ratio</span>
          <span className="mono" style={{ fontSize: 12, color: ratioColor, fontWeight: 700 }}>{(ratio * 100).toFixed(1)}% of income</span>
        </div>
        <div style={{ height: 7, background: T.border, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${ratio * 100}%`, background: ratioColor,
            borderRadius: 4, transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
          }} />
        </div>
        <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: T.textDim }}>
          <span>$0</span><span>{fmt(totalIncome)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Income ─────────────────────────────────────────────────────────────────────
function IncomeTracker({ income, setIncome }) {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');

  const add = () => {
    if (!source.trim() || !amount) return;
    setIncome(p => [...p, { id: uid(), source: source.trim(), amount: parseFloat(amount), date: today() }]);
    setSource(''); setAmount('');
  };

  const total = useMemo(() => income.reduce((s, i) => s + parseFloat(i.amount || 0), 0), [income]);

  return (
    <div className="fade-in">
      <SectionHeader title="Income" badge={`${income.length} entries`} total={total} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <Input placeholder="Source — e.g. Freelance, Salary" value={source}
          onChange={e => setSource(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} style={{ flex: 2 }} />
        <Input placeholder="Amount" type="number" value={amount}
          onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} style={{ flex: 1 }} />
        <Btn onClick={add}><Plus size={15} /> Add</Btn>
      </div>

      {income.length === 0 ? <Empty text="No income entries yet." /> : (
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 4, overflow: 'hidden' }}>
          <THead cols={['Date', 'Source', 'Amount', '']} widths={['130px', '1fr', '140px', '42px']} />
          {income.map((item, i) => (
            <div key={item.id} className="row-item fade-in" style={{
              display: 'grid', gridTemplateColumns: '130px 1fr 140px 42px',
              padding: '14px 16px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
              alignItems: 'center',
            }}>
              <span className="mono" style={{ fontSize: 13, color: T.textDim }}>{item.date}</span>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{item.source}</span>
              <span className="mono" style={{ fontSize: 15, color: T.green, textAlign: 'right', fontWeight: 700 }}>+{fmt(item.amount)}</span>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="del-btn press" onClick={() => setIncome(p => p.filter(x => x.id !== item.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.red, padding: 4 }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          <div style={{
            display: 'grid', gridTemplateColumns: '130px 1fr 140px 42px',
            padding: '12px 16px', borderTop: `1px solid ${T.borderLight}`,
            background: T.accentBg, alignItems: 'center',
          }}>
            <div />
            <span style={{ fontSize: 12, color: T.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>Total</span>
            <span className="mono" style={{ fontSize: 20, fontWeight: 800, color: T.accent, textAlign: 'right' }}>{fmt(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Things ─────────────────────────────────────────────────────────────────────
function ThingsPurchases({ things, setThings }) {
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const add = () => {
    if (!title.trim() || !amount) return;
    setThings(p => [...p, { id: uid(), month, year: YEAR, title: title.trim(), amount: parseFloat(amount), date: today() }]);
    setTitle(''); setAmount('');
  };

  const total = useMemo(() => things.reduce((s, t) => s + parseFloat(t.amount || 0), 0), [things]);

  const byMonth = useMemo(() => {
    const g = {};
    MONTHS.forEach(m => { g[m] = []; });
    things.forEach(t => { if (g[t.month]) g[t.month].push(t); });
    return g;
  }, [things]);

  const activeMonths = MONTHS.filter(m => byMonth[m].length > 0);

  return (
    <div className="fade-in">
      <SectionHeader title="Things" badge={`${things.length} purchases`} total={total} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <Sel value={month} onChange={e => setMonth(e.target.value)} style={{ width: 90 }}>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </Sel>
        <Input placeholder="What did you buy?" value={title}
          onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} style={{ flex: 2 }} />
        <Input placeholder="Amount" type="number" value={amount}
          onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} style={{ flex: 1 }} />
        <Btn onClick={add}><Plus size={15} /> Add</Btn>
      </div>

      {things.length === 0 ? <Empty text="No purchases yet." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeMonths.map(m => {
            const items = byMonth[m];
            const sub   = items.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
            return (
              <div key={m} style={{ border: `1px solid ${T.border}`, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  padding: '11px 16px', background: T.accentBg, borderBottom: `1px solid ${T.border}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, color: T.accent, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>{m} {YEAR}</span>
                  <span className="mono" style={{ fontSize: 15, color: T.accent, fontWeight: 700 }}>{fmt(sub)}</span>
                </div>
                {items.map((item, i) => (
                  <div key={item.id} className="row-item fade-in" style={{
                    display: 'grid', gridTemplateColumns: '1fr 140px 42px',
                    padding: '13px 16px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{item.title}</span>
                    <span className="mono" style={{ fontSize: 15, color: T.textMuted, textAlign: 'right', fontWeight: 600 }}>{fmt(item.amount)}</span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="del-btn press" onClick={() => setThings(p => p.filter(x => x.id !== item.id))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.red, padding: 4 }}>
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
    </div>
  );
}

// ─── Food Order Card ─────────────────────────────────────────────────────────────
function FoodOrderCard({ order, onUpdate, onDelete }) {
  const [open, setOpen]       = useState(!order.collapsed);
  const [newName, setNewName] = useState('');

  const patch = (changes) => onUpdate({ ...order, ...changes });

  const fee       = parseFloat(order.deliveryFee || 0);
  const parts     = order.participants || [];
  const split     = parts.length + 1;
  const myDel     = fee / split;
  const myTot     = parseFloat(order.myFoodCost || 0) + myDel;
  const old       = daysSince(order.date) > 7;
  const unpaid    = parts.filter(p => !p.paid);
  const unpaidAmt = unpaid.reduce((s, p) => s + parseFloat(p.foodCost || 0) + fee / split, 0);
  const hasAlert  = unpaid.length > 0 && old;

  const addPerson = () => {
    if (!newName.trim()) return;
    patch({ participants: [...parts, { id: uid(), name: newName.trim(), foodCost: '', paid: false }] });
    setNewName('');
  };

  const updPart = (id, changes) => patch({ participants: parts.map(p => p.id === id ? { ...p, ...changes } : p) });
  const delPart = (id)          => patch({ participants: parts.filter(p => p.id !== id) });
  const toggle  = () => { setOpen(o => !o); patch({ collapsed: open }); };

  return (
    <div className="fade-in" style={{
      border: `1px solid ${hasAlert ? T.red : T.border}`,
      borderRadius: 4, overflow: 'hidden', marginBottom: 12,
      transition: 'border-color 0.2s',
    }}>
      {/* Card header */}
      <div style={{
        padding: '16px 18px', background: hasAlert ? T.redBg : T.card,
        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
        transition: 'background 0.15s',
      }} onClick={toggle}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mono" style={{ fontSize: 13, color: T.textDim }}>{order.date}</span>
            {hasAlert && (
              <span style={{
                fontSize: 11, color: T.red, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700,
                background: T.redBg, padding: '2px 8px', borderRadius: 2, border: `1px solid ${T.red}`,
              }}>
                {daysSince(order.date)}d unpaid
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 4, alignItems: 'baseline' }}>
            <span className="mono" style={{ fontSize: 16, color: T.text, fontWeight: 700 }}>
              Total: {fmt(order.totalAmount)}
            </span>
            {unpaidAmt > 0 && (
              <span style={{ fontSize: 14, color: hasAlert ? T.red : T.accent, fontWeight: 600 }}>
                {fmt(unpaidAmt)} outstanding
              </span>
            )}
            {parts.length > 0 && unpaid.length === 0 && (
              <span style={{ fontSize: 13, color: T.green, fontWeight: 600 }}>✓ all settled</span>
            )}
          </div>
        </div>
        <div style={{ color: T.textDim }}>{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
        <button className="press" onClick={e => { e.stopPropagation(); onDelete(order.id); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textDim, padding: 4 }}>
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="fade-in" style={{ padding: 20, background: T.bg, borderTop: `1px solid ${T.border}` }}>
          {/* 3 fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Total Order',  key: 'totalAmount' },
              { label: 'My Food Cost', key: 'myFoodCost' },
              { label: 'Delivery Fee', key: 'deliveryFee' },
            ].map(({ label, key }) => (
              <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 11, color: T.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
                <Input type="number" value={order[key] || ''} placeholder="0.00"
                  onChange={e => patch({ [key]: e.target.value })} />
              </label>
            ))}
          </div>

          {/* My cost summary */}
          <div style={{
            display: 'flex', gap: 24, padding: '10px 14px', background: T.card,
            borderRadius: 3, marginBottom: 18, fontSize: 14, color: T.textMuted,
          }}>
            <span>My delivery share: <span className="mono" style={{ color: T.text, fontWeight: 700 }}>{fmt(myDel)}</span></span>
            <span>My total: <span className="mono" style={{ color: T.accent, fontWeight: 800 }}>{fmt(myTot)}</span></span>
            <span style={{ color: T.textDim }}>÷{split} ways</span>
          </div>

          {/* Participants table */}
          {parts.length > 0 && (
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
              <THead cols={['Person', 'Food', 'Owes You', 'Status', '']}
                widths={['1fr', '110px', '120px', '100px', '34px']} />
              {parts.map((p, i) => {
                const owes   = parseFloat(p.foodCost || 0) + fee / split;
                const pAlert = !p.paid && old;
                return (
                  <div key={p.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 110px 120px 100px 34px',
                    padding: '12px 16px', borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                    alignItems: 'center', background: pAlert ? 'rgba(192,57,43,0.05)' : 'transparent',
                    transition: 'background 0.12s',
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: p.paid ? T.textDim : T.text }}>{p.name}</span>
                    <Input type="number" value={p.foodCost || ''} placeholder="0.00"
                      onChange={e => updPart(p.id, { foodCost: e.target.value })}
                      style={{ fontSize: 14, padding: '5px 9px' }} />
                    <span className="mono" style={{
                      fontSize: 15, textAlign: 'right', fontWeight: 700,
                      color: p.paid ? T.textDim : pAlert ? T.red : T.accent,
                      textDecoration: p.paid ? 'line-through' : 'none',
                    }}>{fmt(owes)}</span>
                    <button onClick={() => updPart(p.id, { paid: !p.paid })} style={{
                      background: p.paid ? T.greenBg : T.accentBg,
                      border: `1px solid ${p.paid ? T.green : T.accentDim}`,
                      borderRadius: 3, color: p.paid ? T.green : T.accent,
                      fontSize: 12, padding: '5px 0', cursor: 'pointer', width: '100%',
                      fontFamily: "'Courier New', monospace", letterSpacing: '0.5px', fontWeight: 700,
                    }}>
                      {p.paid ? '✓ paid' : 'unpaid'}
                    </button>
                    <button className="press" onClick={() => delPart(p.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textDim, padding: 4, display: 'flex', justifyContent: 'flex-end' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add person */}
          <div style={{ display: 'flex', gap: 10 }}>
            <Input placeholder="Add person to split…" value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPerson()} />
            <Btn onClick={addPerson} variant="ghost"><Plus size={15} /> Add</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function FoodOrders({ foodOrders, setFoodOrders }) {
  const addOrder = () => {
    setFoodOrders(p => [{
      id: uid(), date: today(), totalAmount: '', myFoodCost: '', deliveryFee: '',
      participants: [], collapsed: false,
    }, ...p]);
  };

  const updateOrder = (upd) => setFoodOrders(p => p.map(o => o.id === upd.id ? upd : o));
  const deleteOrder = (id)  => setFoodOrders(p => p.filter(o => o.id !== id));

  const totalUnpaid = useMemo(() => foodOrders.reduce((s, o) => {
    const fee = parseFloat(o.deliveryFee || 0);
    const parts = o.participants || [];
    const split = parts.length + 1;
    return s + parts.filter(p => !p.paid).reduce((ps, p) => ps + parseFloat(p.foodCost || 0) + fee / split, 0);
  }, 0), [foodOrders]);

  return (
    <div className="fade-in">
      <SectionHeader title="Food Orders" badge={`${foodOrders.length} orders`}
        total={totalUnpaid} totalLabel="unpaid" />
      <div style={{ marginBottom: 22 }}>
        <Btn onClick={addOrder}><Plus size={15} /> New Order</Btn>
      </div>
      {foodOrders.length === 0 ? <Empty text="No food orders yet." /> : (
        foodOrders.map(o => (
          <FoodOrderCard key={o.id} order={o} onUpdate={updateOrder} onDelete={deleteOrder} />
        ))
      )}
    </div>
  );
}

// ─── Chart + Stats ───────────────────────────────────────────────────────────────
function ChartTab({ things, foodOrders }) {
  const data = useMemo(() => MONTHS.map(m => {
    const thingsAmt = things.filter(t => t.month === m).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    const foodAmt   = foodOrders.reduce((s, o) => {
      if (MONTHS[new Date(o.date + 'T00:00:00').getMonth()] !== m) return s;
      return s + parseFloat(o.myFoodCost || 0);
    }, 0);
    return { month: m, things: thingsAmt, food: foodAmt, total: thingsAmt + foodAmt };
  }), [things, foodOrders]);

  const hasData = data.some(d => d.total > 0);

  const stats = useMemo(() => {
    const allT = things.map(t => ({ label: t.title, amount: parseFloat(t.amount || 0) }));
    const biggestPurchase = allT.length > 0 ? allT.reduce((a, b) => a.amount > b.amount ? a : b) : null;
    const monthBest = data.reduce((a, b) => b.total > a.total ? b : a, { month: null, total: 0 });
    const avgOrder  = foodOrders.length > 0
      ? foodOrders.reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0) / foodOrders.length : 0;
    return { biggestPurchase, monthBest, avgOrder };
  }, [things, foodOrders, data]);

  return (
    <div className="fade-in">
      <SectionHeader title="Monthly Chart" badge="spending by month" />

      {hasData ? (
        <div style={{ height: 260, marginBottom: 32 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={18}>
              <XAxis dataKey="month" tick={{ fill: T.textDim, fontSize: 12, fontFamily: 'Courier New', fontWeight: 600 }}
                axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={{ fill: T.textDim, fontSize: 12, fontFamily: 'Courier New' }}
                axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={52} />
              <Tooltip
                contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 3, fontFamily: 'Courier New', fontSize: 13 }}
                labelStyle={{ color: T.accent, letterSpacing: '1px', fontWeight: 700 }}
                itemStyle={{ color: T.text }}
                formatter={v => [fmt(v)]}
              />
              <Bar dataKey="things" name="Things" stackId="a" fill={T.accentDim} />
              <Bar dataKey="food"   name="Food"   stackId="a" fill={T.accent} radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 10 }}>
            {[{ color: T.accentDim, label: 'Things' }, { color: T.accent, label: 'Food (mine)' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 11, height: 11, background: l.color, borderRadius: 1 }} />
                <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Empty text="Add purchases or food orders to see the chart." />
      )}

      <Divider label="Quick Stats" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
        {stats.biggestPurchase && (
          <StatPill label="Biggest Purchase"
            value={`${stats.biggestPurchase.label} — ${fmt(stats.biggestPurchase.amount)}`} />
        )}
        {stats.monthBest.month && stats.monthBest.total > 0 && (
          <StatPill label="Highest Spend Month"
            value={`${stats.monthBest.month} — ${fmt(stats.monthBest.total)}`} />
        )}
        {stats.avgOrder > 0 && (
          <StatPill label="Avg Food Order" value={fmt(stats.avgOrder)} />
        )}
        {!stats.biggestPurchase && !stats.avgOrder && (
          <div style={{ color: T.textDim, fontSize: 14, fontStyle: 'italic' }}>No data yet.</div>
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>{label}</div>
      <div className="mono" style={{ fontSize: 15, color: T.text, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────────
function ExportBtn({ income, things, foodOrders }) {
  const [copied, setCopied] = useState(false);

  const run = () => {
    const totIncome = income.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
    const totThings = things.reduce((s, t) => s + parseFloat(t.amount || 0), 0);
    let myFood = 0, unpaid = 0;
    foodOrders.forEach(o => {
      myFood += parseFloat(o.myFoodCost || 0);
      const fee = parseFloat(o.deliveryFee || 0);
      const split = (o.participants?.length || 0) + 1;
      o.participants?.forEach(p => {
        if (!p.paid) unpaid += parseFloat(p.foodCost || 0) + fee / split;
      });
    });
    const bal = totIncome - totThings - myFood;
    const sep = '─'.repeat(44);
    const lines = [
      `LEDGER SUMMARY — ${YEAR}`,
      `Generated: ${new Date().toLocaleString()}`,
      sep,
      `Income         ${fmt(totIncome).padStart(12)}`,
      `Things spent   ${fmt(totThings).padStart(12)}`,
      `Food (mine)    ${fmt(myFood).padStart(12)}`,
      `Others owe     ${fmt(unpaid).padStart(12)}`,
      `Net balance    ${fmt(bal).padStart(12)}`,
      '',
      `INCOME`, sep,
      ...income.map(i => `${i.date}  ${i.source.slice(0,22).padEnd(22)}  ${fmt(i.amount)}`),
      '',
      `THINGS`, sep,
      ...things.map(t => `${t.month.padEnd(5)}  ${t.title.slice(0,22).padEnd(22)}  ${fmt(t.amount)}`),
      '',
      `FOOD ORDERS`, sep,
      ...foodOrders.flatMap(o => {
        const fee = parseFloat(o.deliveryFee || 0);
        const split = (o.participants?.length || 0) + 1;
        return [
          `${o.date}  Total: ${fmt(o.totalAmount)}  My food: ${fmt(o.myFoodCost)}`,
          ...(o.participants || []).map(p => {
            const owes = parseFloat(p.foodCost || 0) + fee / split;
            return `  ${p.name.padEnd(20)} owes ${fmt(owes)} [${p.paid ? 'PAID' : 'UNPAID'}]`;
          }),
        ];
      }),
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Btn onClick={run} variant="ghost" style={{ fontSize: 13 }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Export'}
    </Btn>
  );
}

// ─── App Shell ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'income', label: 'Income' },
  { id: 'things', label: 'Things' },
  { id: 'food',   label: 'Food'   },
  { id: 'chart',  label: 'Chart'  },
];

export default function App() {
  const [income,     setIncome]     = useLocalStorage('ldgr_income', []);
  const [things,     setThings]     = useLocalStorage('ldgr_things', []);
  const [foodOrders, setFoodOrders] = useLocalStorage('ldgr_food',   []);
  const [tab,        setTab]        = useState('income');

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <GlobalStyle />

      {/* ── Nav ── */}
      <header style={{
        borderBottom: `1px solid ${T.border}`, padding: '0 48px',
        position: 'sticky', top: 0, background: T.bg, zIndex: 100,
      }}>
        <div style={{ margin: '0 auto', display: 'flex', alignItems: 'stretch' }}>
          {/* Wordmark */}
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '14px 28px 14px 0', marginRight: 10, borderRight: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: T.accent, letterSpacing: '4px', textTransform: 'uppercase' }}>Ledger</div>
            <div className="mono" style={{ fontSize: 11, color: T.textDim, letterSpacing: '2px', marginTop: 2 }}>{YEAR}</div>
          </div>

          {/* Tabs */}
          <nav style={{ display: 'flex', flex: 1 }}>
            {TABS.map(t => (
              <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)} style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${tab === t.id ? T.accent : 'transparent'}`,
                color: tab === t.id ? T.accent : T.textMuted,
                padding: '0 20px',
                fontSize: 13,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: "'Courier New', monospace",
                fontWeight: tab === t.id ? 700 : 500,
                height: '100%',
              }}>
                {t.label}
              </button>
            ))}
          </nav>

          {/* Export */}
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 14 }}>
            <ExportBtn income={income} things={things} foodOrders={foodOrders} />
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ padding: '36px 48px 72px' }}>
        <Dashboard income={income} things={things} foodOrders={foodOrders} />

        {tab === 'income' && <IncomeTracker income={income} setIncome={setIncome} />}
        {tab === 'things' && <ThingsPurchases things={things} setThings={setThings} />}
        {tab === 'food'   && <FoodOrders foodOrders={foodOrders} setFoodOrders={setFoodOrders} />}
        {tab === 'chart'  && <ChartTab things={things} foodOrders={foodOrders} />}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: '22px 48px', textAlign: 'center' }}>
        <span className="mono" style={{ fontSize: 11, color: T.textDim, letterSpacing: '2px', textTransform: 'uppercase' }}>
          All data stored locally — nothing leaves your device
        </span>
      </footer>
    </div>
  );
}

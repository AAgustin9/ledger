import { useMemo } from 'react';
import { TrendingUp, ShoppingBag, Utensils, Users } from 'lucide-react';
import { YEAR } from '../../constants/app';
import { fmt } from '../../utils/ledger';

const SUMMARY_ITEMS = [
  { label: 'Income', icon: TrendingUp, tone: 'positive' },
  { label: 'Things', icon: ShoppingBag, tone: 'muted' },
  { label: 'Food (mine)', icon: Utensils, tone: 'muted' },
  { label: 'Owed to You', icon: Users, tone: 'owed' },
  { label: 'Net Balance', tone: 'balance', big: true },
];

export default function Dashboard({ income, things, foodOrders }) {
  const totalIncome = useMemo(
    () => income.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0),
    [income]
  );
  const totalThings = useMemo(
    () => things.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0),
    [things]
  );

  const { myFood, othersOwed, collected } = useMemo(() => {
    let myFoodCost = 0;
    let owed = 0;
    let paid = 0;

    foodOrders.forEach((order) => {
      myFoodCost += parseFloat(order.myFoodCost || 0);
      const fee = parseFloat(order.deliveryFee || 0);
      const participants = order.participants || [];
      const split = participants.length + 1;

      participants.forEach((participant) => {
        const participantOwes = parseFloat(participant.foodCost || 0) + fee / split;

        if (participant.paid) {
          paid += participantOwes;
        } else {
          owed += participantOwes;
        }
      });
    });

    return { myFood: myFoodCost, othersOwed: owed, collected: paid };
  }, [foodOrders]);

  const balance = totalIncome - totalThings - myFood + collected;
  const spent = totalThings + myFood;
  const ratio = totalIncome > 0 ? Math.min(spent / totalIncome, 1) : 0;
  const ratioClass = ratio > 0.85 ? 'negative' : ratio > 0.6 ? 'accent' : 'positive';

  const cards = SUMMARY_ITEMS.map((item) => {
    if (item.label === 'Income') {
      return { ...item, value: totalIncome };
    }

    if (item.label === 'Things') {
      return { ...item, value: totalThings };
    }

    if (item.label === 'Food (mine)') {
      return { ...item, value: myFood };
    }

    if (item.label === 'Owed to You') {
      return {
        ...item,
        value: othersOwed,
        tone: othersOwed > 0 ? 'accent' : 'positive',
      };
    }

    return {
      ...item,
      value: balance,
      tone: balance >= 0 ? 'positive' : 'negative',
      sub: collected > 0 ? `+${fmt(collected)} collected` : null,
    };
  });

  return (
    <section className="dashboard-section">
      <div className="dashboard-heading">
        <span className="dashboard-label">Financial Summary</span>
        <div className="divider-line" />
        <span className="mono dashboard-year">{YEAR}</span>
      </div>

      <div className="summary-grid">
        {cards.map(({ label, value, icon: Icon, tone, big, sub }) => (
          <div key={label} className="summary-card">
            <div className="summary-card-label">
              {Icon ? <Icon size={13} /> : null}
              {label}
            </div>
            <div className={`mono summary-card-value ${big ? 'is-big' : ''} tone-${tone}`}>
              {fmt(value)}
            </div>
            {sub ? <div className="summary-card-sub">{sub}</div> : null}
          </div>
        ))}
      </div>

      <div>
        <div className="ratio-header">
          <span className="ratio-label">Spending Ratio</span>
          <span className={`mono ratio-value tone-${ratioClass}`}>{(ratio * 100).toFixed(1)}% of income</span>
        </div>
        <div className="ratio-track">
          <div className={`ratio-fill tone-${ratioClass}`} style={{ width: `${ratio * 100}%` }} />
        </div>
        <div className="mono ratio-scale">
          <span>$0</span>
          <span>{fmt(totalIncome)}</span>
        </div>
      </div>
    </section>
  );
}

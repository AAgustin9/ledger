import { useMemo } from 'react';
import { ShoppingBag, Utensils, Users } from 'lucide-react';
import { YEAR } from '../../constants/app';
import { fmt } from '../../utils/ledger';

const SUMMARY_ITEMS = [
  { label: 'Things', icon: ShoppingBag, tone: 'muted' },
  { label: 'Food (mine)', icon: Utensils, tone: 'muted' },
  { label: 'Food (total)', icon: Utensils, tone: 'muted' },
  { label: 'Owed to You', icon: Users, tone: 'owed' },
];

export default function Dashboard({ things, foodOrders }) {
  const totalThings = useMemo(
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

  const { thingsOwed, thingsCollected } = useMemo(() => {
    let owed = 0;
    let collected = 0;
    things.forEach((item) => {
      if (item.groupBuy && item.participants?.length > 0) {
        const share = parseFloat(item.amount || 0) / (item.participants.length + 1);
        item.participants.forEach((p) => {
          if (p.paid) collected += share;
          else owed += share;
        });
      }
    });
    return { thingsOwed: owed, thingsCollected: collected };
  }, [things]);

  const { myFood, othersOwed, collected, totalFood } = useMemo(() => {
    let myFoodCost = 0;
    let owed = 0;
    let paid = 0;

    foodOrders.forEach((order) => {
      const hasPaidBy = !!order.paidBy;

      if (!hasPaidBy) {
        myFoodCost += parseFloat(order.myFoodCost || 0);
      }

      const fee = parseFloat(order.deliveryFee || 0);
      const participants = order.participants || [];
      const iOrdered = parseFloat(order.myFoodCost || 0) > 0;
      const split = participants.length + (iOrdered ? 1 : 0);

      if (hasPaidBy) {
        const myShare = parseFloat(order.myFoodCost || 0) + (iOrdered && split > 0 ? fee / split : 0);
        myFoodCost += myShare;
      } else {
        participants.forEach((participant) => {
          const participantOwes = parseFloat(participant.foodCost || 0) + fee / split;
          if (participant.paid) {
            paid += participantOwes;
          } else {
            owed += participantOwes;
          }
        });
      }
    });

    const totalFood = foodOrders.reduce((sum, order) => {
      const orderTotal =
        parseFloat(order.myFoodCost || 0) +
        (order.participants || []).reduce((s, p) => s + parseFloat(p.foodCost || 0), 0) +
        parseFloat(order.deliveryFee || 0);
      return sum + orderTotal;
    }, 0);

    return { myFood: myFoodCost, othersOwed: owed, collected: paid, totalFood };
  }, [foodOrders]);

  const totalOwed = othersOwed + thingsOwed;
  const totalCollected = collected + thingsCollected;

  const cards = SUMMARY_ITEMS.map((item) => {
    if (item.label === 'Things') {
      return { ...item, value: totalThings };
    }
    if (item.label === 'Food (mine)') {
      return { ...item, value: myFood };
    }
    if (item.label === 'Food (total)') {
      return { ...item, value: totalFood };
    }
    return {
      ...item,
      value: totalOwed,
      tone: totalOwed > 0 ? 'accent' : 'positive',
      sub: totalCollected > 0 ? `+${fmt(totalCollected)} collected` : null,
    };
  });

  return (
    <section className="dashboard-section">
      <div className="dashboard-heading">
        <span className="dashboard-label">Summary</span>
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
    </section>
  );
}

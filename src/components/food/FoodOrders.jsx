import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { MONTHS, YEAR } from '../../constants/app';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import SectionHeader from '../ui/SectionHeader';
import FoodOrderCard from './FoodOrderCard';
import { today, uid } from '../../utils/ledger';

export default function FoodOrders({ foodOrders, setFoodOrders }) {
  const [openId, setOpenId] = useState(null);

  const toggleOpen = (id) => setOpenId((current) => (current === id ? null : id));

  const totalUnpaid = useMemo(
    () =>
      foodOrders.reduce((sum, order) => {
        const fee = parseFloat(order.deliveryFee || 0);
        const participants = order.participants || [];
        const split = participants.length + 1;

        return (
          sum +
          participants
            .filter((participant) => !participant.paid)
            .reduce(
              (participantSum, participant) =>
                participantSum + parseFloat(participant.foodCost || 0) + fee / split,
              0
            )
        );
      }, 0),
    [foodOrders]
  );

  const byMonth = useMemo(() => {
    const groups = Object.fromEntries(MONTHS.map((m) => [m, []]));
    foodOrders.forEach((order) => {
      const m = order.month || MONTHS[new Date(order.date).getMonth()];
      if (groups[m]) groups[m].push(order);
    });
    return groups;
  }, [foodOrders]);

  const activeMonths = [...MONTHS].reverse().filter((m) => byMonth[m].length > 0);

  const addOrder = () => {
    const newId = uid();
    setFoodOrders((current) => [
      {
        id: newId,
        date: today(),
        day: String(new Date().getDate()),
        month: MONTHS[new Date().getMonth()],
        year: YEAR,
        totalAmount: '',
        myFoodCost: '',
        deliveryFee: '',
        participants: [],
      },
      ...current,
    ]);
    setOpenId(newId);
  };

  const updateOrder = (updatedOrder) => {
    setFoodOrders((current) =>
      current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
  };

  const deleteOrder = (id) => {
    setFoodOrders((current) => current.filter((order) => order.id !== id));
  };

  return (
    <section className="fade-in">
      <SectionHeader
        title="Food Orders"
        badge={`${foodOrders.length} orders`}
        total={totalUnpaid}
        totalLabel="unpaid"
      />
      <div className="section-actions">
        <Button onClick={addOrder}>
          <Plus size={15} />
          New Order
        </Button>
      </div>
      {foodOrders.length === 0 ? (
        <EmptyState text="No food orders yet." />
      ) : (
        <div className="stack-list">
          {activeMonths.map((month) => {
            const entries = byMonth[month];
            const subtotal = entries.reduce((sum, order) => {
              const fee = parseFloat(order.deliveryFee || 0);
              const participants = order.participants || [];
              const split = participants.length + (parseFloat(order.myFoodCost || 0) > 0 ? 1 : 0);
              const myDeliveryShare = split > 0 ? fee / split : 0;
              return sum + parseFloat(order.myFoodCost || 0) + myDeliveryShare;
            }, 0);

            return (
              <div key={month} className="month-card">
                <div className="month-card-header">
                  <span className="month-card-title">{month} {YEAR}</span>
                  <span className="mono month-card-total">{subtotal > 0 ? subtotal.toFixed(2) : '—'}</span>
                </div>
                {[...entries]
                  .sort((a, b) => parseInt(b.day || 0) - parseInt(a.day || 0))
                  .map((order) => (
                    <FoodOrderCard
                      key={order.id}
                      order={order}
                      isOpen={openId === order.id}
                      onToggle={toggleOpen}
                      onUpdate={updateOrder}
                      onDelete={deleteOrder}
                    />
                  ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

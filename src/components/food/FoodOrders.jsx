import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
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

  const addOrder = () => {
    const newId = uid();
    setFoodOrders((current) => [
      {
        id: newId,
        date: today(),
        day: String(new Date().getDate()),
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
        [...foodOrders]
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
        ))
      )}
    </section>
  );
}

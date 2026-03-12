import { useState } from 'react'; // useState kept for newName
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { daysSince, fmt, uid } from '../../utils/ledger';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TableHead from '../ui/TableHead';

export default function FoodOrderCard({ order, isOpen, onToggle, onUpdate, onDelete }) {
  const [newName, setNewName] = useState('');

  const participants = order.participants || [];
  const fee = parseFloat(order.deliveryFee || 0);
  const iOrdered = parseFloat(order.myFoodCost || 0) > 0;
  const split = participants.length + (iOrdered ? 1 : 0);
  const myDeliveryShare = iOrdered && split > 0 ? fee / split : 0;
  const myTotal = parseFloat(order.myFoodCost || 0) + myDeliveryShare;
  const isOld = daysSince(order.date) > 7;
  const unpaidParticipants = participants.filter((participant) => !participant.paid);
  const unpaidAmount = unpaidParticipants.reduce(
    (sum, participant) => sum + parseFloat(participant.foodCost || 0) + fee / split,
    0
  );
  const hasAlert = unpaidParticipants.length > 0 && isOld;

  const patchOrder = (changes) => onUpdate({ ...order, ...changes });

  const addParticipant = () => {
    if (!newName.trim()) {
      return;
    }

    patchOrder({
      participants: [
        ...participants,
        { id: uid(), name: newName.trim(), foodCost: '', paid: false },
      ],
    });
    setNewName('');
  };

  const updateParticipant = (id, changes) => {
    patchOrder({
      participants: participants.map((participant) =>
        participant.id === id ? { ...participant, ...changes } : participant
      ),
    });
  };

  const deleteParticipant = (id) => {
    patchOrder({
      participants: participants.filter((participant) => participant.id !== id),
    });
  };

  const toggleOpen = () => onToggle(order.id);

  const totalEntered =
    parseFloat(order.myFoodCost || 0) +
    participants.reduce((s, p) => s + parseFloat(p.foodCost || 0), 0) +
    fee;
  const orderTotal = parseFloat(order.totalAmount || 0);
  const balanceDiff = orderTotal > 0 ? +(totalEntered - orderTotal).toFixed(2) : null;
  const balanceOk = balanceDiff === 0;

  return (
    <article className="fade-in food-order-card" data-alert={hasAlert ? 'true' : 'false'}>
      <div
        className="food-order-header"
        data-alert={hasAlert ? 'true' : 'false'}
        onClick={toggleOpen}
      >
        <div className="food-order-header-main">
          <div className="food-order-header-top">
            <span className="mono row-date">
              {order.day ? `Day ${order.day}` : order.date}
            </span>
            {hasAlert ? (
              <span className="stale-badge">{daysSince(order.date)}d unpaid</span>
            ) : null}
          </div>
          {order.title ? (
            <div className="food-order-title">{order.title}</div>
          ) : null}
          <div className="food-order-summary">
            <span className="mono food-order-total">Total: {fmt(order.totalAmount)}</span>
            {unpaidAmount > 0 ? (
              <span className={hasAlert ? 'danger-text outstanding-text' : 'accent-text outstanding-text'}>
                {fmt(unpaidAmount)} outstanding
              </span>
            ) : null}
            {participants.length > 0 && unpaidParticipants.length === 0 ? (
              <span className="positive-text settled-text">✓ all settled</span>
            ) : null}
          </div>
        </div>
        <div className="food-order-actions">
          <div className="muted-text">{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
          <button
            className="press icon-button muted-text"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(order.id);
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="fade-in food-order-body">
          <label className="field-group" style={{ marginBottom: 12 }}>
            <span className="field-label">Order Title</span>
            <Input
              placeholder="e.g. McDonald's..."
              value={order.title || ''}
              onChange={(event) => patchOrder({ title: event.target.value })}
            />
          </label>

          <div className="food-order-fields">
            <label className="field-group">
              <span className="field-label">Day</span>
              <Input
                type="number"
                value={order.day || ''}
                placeholder={new Date().getDate()}
                min={1}
                max={31}
                onChange={(event) => patchOrder({ day: event.target.value })}
              />
            </label>
            {[
              { label: 'Total Order', key: 'totalAmount' },
              { label: 'My Food Cost', key: 'myFoodCost' },
              { label: 'Delivery Fee', key: 'deliveryFee' },
            ].map(({ label, key }) => (
              <label key={key} className="field-group">
                <span className="field-label">{label}</span>
                <Input
                  type="number"
                  value={order[key] || ''}
                  placeholder="0.00"
                  onChange={(event) => patchOrder({ [key]: event.target.value })}
                />
              </label>
            ))}
          </div>

          <div className="food-summary-box">
            <span>
              My delivery share:{' '}
              <span className="mono food-summary-value">{fmt(myDeliveryShare)}</span>
            </span>
            <span>
              My total: <span className="mono food-summary-accent">{fmt(myTotal)}</span>
            </span>
            <span className="food-summary-split">÷{split} ways</span>
            {balanceDiff !== null ? (
              <span className={balanceOk ? 'balance-ok' : 'balance-off'}>
                {balanceOk
                  ? '✓ balanced'
                  : `${balanceDiff > 0 ? '+' : ''}${fmt(Math.abs(balanceDiff))} ${balanceDiff > 0 ? 'over' : 'under'}`}
              </span>
            ) : null}
          </div>

          {participants.length > 0 ? (
            <div className="table-shell compact-shell">
              <TableHead
                cols={['Person', 'Food', 'Owes You', 'Status', '']}
                widths={['1fr', '110px', '120px', '100px', '34px']}
              />
              {participants.map((participant, index) => {
                const owes = parseFloat(participant.foodCost || 0) + fee / split;
                const participantAlert = !participant.paid && isOld;

                return (
                  <div
                    key={participant.id}
                    className="participant-row"
                    style={{
                      gridTemplateColumns: '1fr 110px 120px 100px 34px',
                      borderTop: index > 0 ? '1px solid var(--color-border)' : 'none',
                      background: participantAlert ? 'rgba(192,57,43,0.05)' : 'transparent',
                    }}
                  >
                    <span className={`row-title ${participant.paid ? 'muted-text' : ''}`}>{participant.name}</span>
                    <Input
                      type="number"
                      value={participant.foodCost || ''}
                      placeholder="0.00"
                      className="compact-input"
                      onChange={(event) => updateParticipant(participant.id, { foodCost: event.target.value })}
                    />
                    <span
                      className={`mono participant-owes ${participant.paid ? 'muted-text struck-text' : participantAlert ? 'danger-text' : 'accent-text'}`}
                    >
                      {fmt(owes)}
                    </span>
                    <button
                      className={`status-toggle ${participant.paid ? 'paid' : 'unpaid'}`}
                      onClick={() => updateParticipant(participant.id, { paid: !participant.paid })}
                    >
                      {participant.paid ? '✓ paid' : 'unpaid'}
                    </button>
                    <button
                      className="press icon-button muted-text"
                      onClick={() => deleteParticipant(participant.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="form-row">
            <Input
              className="flex-1"
              placeholder="Add person to split…"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && addParticipant()}
            />
            <Button onClick={addParticipant} variant="ghost">
              <Plus size={15} />
              Add
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

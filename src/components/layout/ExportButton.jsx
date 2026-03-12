import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { YEAR } from '../../constants/app';
import { fmt } from '../../utils/ledger';
import Button from '../ui/Button';

export default function ExportButton({ income, things, foodOrders }) {
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalThings = things.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    let myFood = 0;
    let unpaid = 0;

    foodOrders.forEach((order) => {
      myFood += parseFloat(order.myFoodCost || 0);
      const fee = parseFloat(order.deliveryFee || 0);
      const split = (order.participants?.length || 0) + 1;

      order.participants?.forEach((participant) => {
        if (!participant.paid) {
          unpaid += parseFloat(participant.foodCost || 0) + fee / split;
        }
      });
    });

    const balance = totalIncome - totalThings - myFood;
    const separator = '─'.repeat(44);
    const lines = [
      `LEDGER SUMMARY — ${YEAR}`,
      `Generated: ${new Date().toLocaleString()}`,
      separator,
      `Income         ${fmt(totalIncome).padStart(12)}`,
      `Things spent   ${fmt(totalThings).padStart(12)}`,
      `Food (mine)    ${fmt(myFood).padStart(12)}`,
      `Others owe     ${fmt(unpaid).padStart(12)}`,
      `Net balance    ${fmt(balance).padStart(12)}`,
      '',
      `INCOME`,
      separator,
      ...income.map((item) => `${item.date}  ${item.source.slice(0, 22).padEnd(22)}  ${fmt(item.amount)}`),
      '',
      `THINGS`,
      separator,
      ...things.map((item) => `${item.month.padEnd(5)}  ${item.title.slice(0, 22).padEnd(22)}  ${fmt(item.amount)}`),
      '',
      `FOOD ORDERS`,
      separator,
      ...foodOrders.flatMap((order) => {
        const fee = parseFloat(order.deliveryFee || 0);
        const split = (order.participants?.length || 0) + 1;

        return [
          `${order.date}  Total: ${fmt(order.totalAmount)}  My food: ${fmt(order.myFoodCost)}`,
          ...(order.participants || []).map((participant) => {
            const owes = parseFloat(participant.foodCost || 0) + fee / split;
            return `  ${participant.name.padEnd(20)} owes ${fmt(owes)} [${participant.paid ? 'PAID' : 'UNPAID'}]`;
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
    <Button onClick={handleExport} variant="ghost" className="export-button">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Export'}
    </Button>
  );
}

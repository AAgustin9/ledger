import { fmt } from '../../utils/ledger';

export default function SectionHeader({ title, badge, total, totalLabel = 'total' }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {badge ? <span className="section-badge">{badge}</span> : null}
      <div className="section-spacer" />
      {total !== undefined ? (
        <span className="section-total mono">
          {fmt(total)} {totalLabel}
        </span>
      ) : null}
    </div>
  );
}

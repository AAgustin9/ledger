export default function Divider({ label }) {
  return (
    <div className="divider-row">
      {label ? <span className="divider-label">{label}</span> : null}
      <div className="divider-line" />
    </div>
  );
}

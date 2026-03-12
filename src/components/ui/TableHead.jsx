export default function TableHead({ cols, widths }) {
  return (
    <div className="table-head" style={{ gridTemplateColumns: widths.join(' ') }}>
      {cols.map((col, index) => (
        <span
          key={col}
          className="table-head-cell"
          style={{ textAlign: index >= cols.length - 2 ? 'right' : 'left' }}
        >
          {col}
        </span>
      ))}
    </div>
  );
}

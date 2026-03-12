export default function Select({ className = '', children, ...props }) {
  return (
    <select className={`field-select mono ${className}`.trim()} {...props}>
      {children}
    </select>
  );
}

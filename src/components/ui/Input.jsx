export default function Input({ className = '', ...props }) {
  return <input className={`field-input mono ${className}`.trim()} {...props} />;
}

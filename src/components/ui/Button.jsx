export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`btn btn-${variant} press mono ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

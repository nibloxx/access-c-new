
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-blue-500 text-blue-800'
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;
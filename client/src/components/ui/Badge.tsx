interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'example' | 'success' | 'warning' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClass = `badge-${variant}`;
  return <span className={`badge ${variantClass} ${className}`}>{children}</span>;
}
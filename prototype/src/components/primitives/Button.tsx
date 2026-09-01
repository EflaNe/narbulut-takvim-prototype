import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'quiet';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'sm';
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  return (
    <button
      type="button"
      className={`btn btn--${variant}${size === 'sm' ? ' btn--sm' : ''} ${className}`.trim()}
      {...rest}
    />
  );
}

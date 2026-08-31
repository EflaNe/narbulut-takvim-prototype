import type { ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  size?: number;
  tone?: 'default' | 'sm' | 'onBrand';
}

export function IconButton({ icon, label, size = 15, tone = 'default', className = '', ...rest }: Props) {
  const toneClass = tone === 'sm' ? ' iconbtn--sm' : tone === 'onBrand' ? ' iconbtn--onbrand' : '';
  return (
    <button type="button" aria-label={label} title={label}
      className={`iconbtn${toneClass} ${className}`.trim()} {...rest}>
      <Icon name={icon} size={size} />
    </button>
  );
}

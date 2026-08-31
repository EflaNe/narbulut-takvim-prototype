import { useEffect } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { Icon } from './Icon';

export function Toast() {
  const { ui } = useAppState();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!ui.toast) return;
    const t = window.setTimeout(() => dispatch({ type: 'clearToast' }), 4200);
    return () => window.clearTimeout(t);
  }, [ui.toast, dispatch]);

  if (!ui.toast) return null;
  const { message, tone } = ui.toast;
  return (
    <div className={`toast${tone === 'error' ? ' toast--error' : tone === 'success' ? ' toast--success' : ''}`}
      role="status" aria-live="polite">
      <Icon name={tone === 'error' ? 'xCircle' : tone === 'success' ? 'checkCircle' : 'info'} size={15} />
      <span>{message}</span>
    </div>
  );
}

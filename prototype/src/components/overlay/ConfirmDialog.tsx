import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { Button } from '../primitives/Button';

export function ConfirmDialog() {
  const { ui } = useAppState();
  const dispatch = useDispatch();
  if (!ui.confirm) return null;
  const c = ui.confirm;
  return (
    <div className="dialog__scrim" onClick={() => dispatch({ type: 'closeConfirm' })}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}>
        <div className="dialog__title" id="confirm-title">{c.title}</div>
        <div className="dialog__body">{c.body}</div>
        <div className="dialog__actions">
          <Button variant="secondary" onClick={() => dispatch({ type: 'closeConfirm' })}>Vazgeç</Button>
          <Button variant={c.tone === 'destructive' ? 'danger' : 'primary'}
            onClick={() => dispatch(c.action)}>{c.confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { calendarById, myCalendars } from '../../lib/domain/selectors';
import { longDateLabel, timeRangeLabel } from '../../lib/domain/time';
import { Icon } from '../primitives/Icon';
import { Button } from '../primitives/Button';

/** Boş slot → hızlı oluşturma. Detaylı forma geçiş tek yönlüdür (geri dönüş bağlayıcı değil). */
export function QuickCreatePopover() {
  const state = useAppState();
  const dispatch = useDispatch();
  const qc = state.ui.quickCreate;
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [qc?.date, qc?.start]);

  useEffect(() => {
    if (!qc) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        dispatch({ type: 'closeQuickCreate' });
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'closeQuickCreate' });
    };
    const id = window.setTimeout(() => document.addEventListener('mousedown', onDown), 0);
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [qc, dispatch]);

  if (!qc) return null;
  const defCal = calendarById(state, myCalendars(state).find((c) => c.isDefault)!.id);

  return (
    <div ref={ref} className="popover" role="dialog" aria-label="Hızlı etkinlik oluştur"
      style={{
        left: Math.min(Math.max(qc.x - 148, 12), 1000),
        top: Math.max(qc.y - 20, 12),
      }}>
      <input ref={inputRef} className="qc__title" placeholder="Etkinlik adı"
        value={qc.title} aria-label="Etkinlik adı"
        onChange={(e) => dispatch({ type: 'updateQuickCreate', title: e.target.value })}
        onKeyDown={(e) => { if (e.key === 'Enter') dispatch({ type: 'quickCreateSave' }); }} />
      <div className="qc__meta">
        <Icon name="calendar" size={14} color="var(--text-tertiary)" />
        {longDateLabel(qc.date)} · {timeRangeLabel(qc.start, qc.end)}
      </div>
      <div className="qc__meta">
        <span className="calrow__dot" style={{ background: defCal?.color }} aria-hidden="true" />
        {defCal?.name} <span style={{ color: 'var(--text-muted)' }}>· varsayılan takvim</span>
      </div>
      <div className="qc__actions">
        <Button variant="primary" size="sm" onClick={() => dispatch({ type: 'quickCreateSave' })}>
          Kaydet
        </Button>
        <Button variant="secondary" size="sm" onClick={() => dispatch({ type: 'quickCreateExpand' })}>
          Daha fazla seçenek
        </Button>
      </div>
    </div>
  );
}

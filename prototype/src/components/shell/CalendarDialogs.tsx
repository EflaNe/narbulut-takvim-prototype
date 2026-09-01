import { useEffect, useMemo, useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { calendarById, myCalendars } from '../../lib/domain/selectors';
import { CALENDAR_PALETTE } from '../../lib/domain/types';
import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';
import type { CalendarId } from '../../lib/domain/types';

/** Takvim oluşturma ve düzenleme. Renk yönetilen paletten seçilir (BR-CAL-05). */
export function CalendarFormDialog() {
  const state = useAppState();
  const dispatch = useDispatch();
  const form = state.ui.calendarForm;
  const existing = form?.calendarId ? calendarById(state, form.calendarId) : undefined;

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(CALENDAR_PALETTE[0].hex);

  useEffect(() => {
    if (!form) return;
    setName(existing?.name ?? '');
    setColor(existing?.color ?? CALENDAR_PALETTE[
      state.calendars.length % CALENDAR_PALETTE.length].hex);
  }, [form, existing, state.calendars.length]);

  if (!form) return null;
  const close = () => dispatch({ type: 'closeCalendarForm' });

  const duplicate = state.calendars.some(
    (c) => c.ownerId === state.currentUserId && c.id !== form.calendarId
      && c.name.trim().toLocaleLowerCase('tr-TR') === name.trim().toLocaleLowerCase('tr-TR'));
  const invalid = !name.trim() || duplicate;

  const submit = () => {
    if (invalid) return;
    if (form.mode === 'create') dispatch({ type: 'createCalendar', name, color });
    else dispatch({ type: 'updateCalendar', calendarId: form.calendarId!, name, color });
  };

  return (
    <div className="dialog__scrim" onClick={close}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="calform-title"
        onClick={(e) => e.stopPropagation()}>
        <div className="dialog__title" id="calform-title">
          {form.mode === 'create' ? 'Yeni takvim' : `${existing?.name} takvimini düzenle`}
        </div>

        <div className="dialog__field">
          <div className="dialog__label">Takvim adı</div>
          <input className={`textinput${duplicate ? ' is-invalid' : ''}`} value={name}
            autoFocus={form.focus === 'name'} aria-label="Takvim adı"
            placeholder="Örn. Pazarlama"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
          {duplicate && (
            <div className="inlinemsg inlinemsg--error" style={{ marginTop: 8 }}>
              <Icon name="xCircle" size={14} />Bu adda bir takviminiz zaten var.
            </div>
          )}
        </div>

        <div className="dialog__field">
          <div className="dialog__label">Renk</div>
          <div className="palette" role="radiogroup" aria-label="Takvim rengi">
            {CALENDAR_PALETTE.map((c) => (
              <button key={c.hex} type="button" role="radio" aria-checked={color === c.hex}
                aria-label={c.name} title={c.name}
                className={color === c.hex ? 'is-on' : undefined}
                style={{ background: c.hex }}
                onClick={() => setColor(c.hex)}>
                {color === c.hex && <Icon name="check" size={14} color="#fff" />}
              </button>
            ))}
          </div>
          <div className="shd__hint" style={{ marginTop: 9 }}>
            Renkler durum renkleriyle çakışmayacak biçimde seçilmiştir.
          </div>
        </div>

        <div className="dialog__actions">
          <Button variant="secondary" onClick={close}>Vazgeç</Button>
          <Button variant="primary" disabled={invalid} onClick={submit}>
            {form.mode === 'create' ? 'Oluştur' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Takvim silme — BR-CAL-22 gereği etkinlikler sessizce silinemez.
 * Kullanıcı açık seçim yapar; taşıma önce sunulur (SR-CAL-06).
 */
export function CalendarDeleteDialog() {
  const state = useAppState();
  const dispatch = useDispatch();
  const id = state.ui.deletingCalendarId;
  const cal = id ? calendarById(state, id) : undefined;

  const targets = useMemo(
    () => myCalendars(state).filter((c) => c.id !== id),
    [state, id],
  );
  const [mode, setMode] = useState<'move' | 'purge'>('move');
  const [target, setTarget] = useState<CalendarId | ''>('');

  useEffect(() => {
    setMode('move');
    setTarget(targets[0]?.id ?? '');
  }, [id, targets]);

  if (!cal || !id) return null;
  const events = state.events.filter((e) => e.calendarId === id);
  const shares = state.shares.filter((s) => s.calendarId === id);
  const close = () => dispatch({ type: 'askDeleteCalendar', calendarId: null });
  const canMove = targets.length > 0;

  return (
    <div className="dialog__scrim" onClick={close}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="caldel-title"
        onClick={(e) => e.stopPropagation()}>
        <div className="dialog__title" id="caldel-title">{cal.name} silinsin mi?</div>
        <div className="dialog__body">
          {events.length > 0
            ? <>Bu takvimde <strong>{events.length} etkinlik</strong> var. Ne yapılacağını seçin.</>
            : 'Bu takvimde etkinlik yok.'}
          {shares.length > 0 && (
            <><br />Takvim <strong>{shares.length} kişiyle</strong> paylaşılmış; silme tüm
              paylaşımları kaldırır ve alıcılara bildirim gider.</>
          )}
        </div>

        {events.length > 0 && (
          <div className="dialog__choices">
            <button className={`choice${mode === 'move' ? ' is-on' : ''}`}
              disabled={!canMove} aria-pressed={mode === 'move'}
              onClick={() => canMove && setMode('move')}>
              <span className="choice__radio" />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span className="choice__title">Etkinlikleri başka takvime taşı</span>
                <span className="choice__sub">
                  {canMove
                    ? 'Etkinlikler korunur, rengi hedef takvimin rengine döner.'
                    : 'Taşınacak başka takviminiz yok.'}
                </span>
                {mode === 'move' && canMove && (
                  <select className="textinput" value={target} aria-label="Hedef takvim"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setTarget(e.target.value as CalendarId)}>
                    {targets.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
              </span>
            </button>

            <button className={`choice${mode === 'purge' ? ' is-on' : ''}`}
              aria-pressed={mode === 'purge'} onClick={() => setMode('purge')}>
              <span className="choice__radio" />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span className="choice__title">Etkinlikleri de sil</span>
                <span className="choice__sub">
                  {events.length} etkinlik kalıcı olarak silinir; bağlı oda rezervasyonları iptal olur.
                </span>
              </span>
            </button>
          </div>
        )}

        <div className="dialog__actions">
          <Button variant="secondary" onClick={close}>Vazgeç</Button>
          <Button variant="danger"
            disabled={events.length > 0 && mode === 'move' && !target}
            onClick={() => dispatch({
              type: 'deleteCalendar', calendarId: id,
              mode: events.length === 0 ? 'purge' : mode,
              targetCalendarId: target || undefined,
            })}>
            Takvimi sil
          </Button>
        </div>
      </div>
    </div>
  );
}

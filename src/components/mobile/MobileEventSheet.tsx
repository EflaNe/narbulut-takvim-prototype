import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  calendarById, reservationStatusForEvent, roomById, userById,
} from '../../lib/domain/selectors';
import { DAY_NAMES_LONG, longDateLabel, timeRangeLabel, weekdayIndex } from '../../lib/domain/time';
import { Icon } from '../primitives/Icon';
import { IconButton } from '../primitives/IconButton';
import { Button } from '../primitives/Button';

/**
 * Mobil etkinlik sheet'i.
 * Paylaşılan etkinlik salt okunurdur: Düzenle/Sil gösterilmez, uyarı da gösterilmez (07-B).
 */
export function MobileEventSheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const eventId = state.ui.readOnlyEventId ?? state.ui.draft?.id ?? null;
  const event = state.events.find((e) => e.id === eventId);
  const readOnly = !!state.ui.readOnlyEventId;
  const close = () => dispatch({ type: 'closeEventDrawer' });

  if (!event) {
    // Yeni etkinlik — mobilde hızlı özet formu
    const draft = state.ui.draft;
    if (!draft) return null;
    return (
      <>
        <div className="sheet__scrim" onClick={close} />
        <div className="sheet" role="dialog" aria-modal="true" aria-label="Yeni etkinlik">
          <div className="sheet__grabber" />
          <div className="sheet__head">
            <span className="sheet__title">Yeni etkinlik</span>
            <span className="spacer" />
            <IconButton icon="close" label="Kapat" onClick={close} />
          </div>
          <div className="sheet__body">
            <input className="textinput" autoFocus placeholder="Etkinlik adı" value={draft.title}
              aria-label="Etkinlik adı"
              onChange={(e) => dispatch({ type: 'updateDraft', patch: { title: e.target.value } })} />
            <div className="mob__cardsub" style={{ marginTop: 12 }}>
              {DAY_NAMES_LONG[weekdayIndex(draft.date)]}, {longDateLabel(draft.date)} ·{' '}
              {timeRangeLabel(draft.start, draft.end)}
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <Button variant="primary" onClick={() => dispatch({ type: 'saveEvent' })}>Kaydet</Button>
              <Button variant="secondary" onClick={close}>Vazgeç</Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const cal = calendarById(state, event.calendarId);
  const owner = cal ? userById(state, cal.ownerId) : undefined;
  const room = roomById(state, event.roomId);
  const status = reservationStatusForEvent(state, event.id);

  return (
    <>
      <div className="sheet__scrim" onClick={close} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={event.title}>
        <div className="sheet__grabber" />
        <div className="sheet__head">
          <span className="sheet__title">{event.title}</span>
          <span className="spacer" />
          <IconButton icon="close" label="Kapat" onClick={close} />
        </div>
        <div className="sheet__body">
          <div className="mob__cardsub" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="calrow__dot" style={{ background: cal?.color }} />
            {cal?.name}
            <span className="evd__sep">·</span>
            {DAY_NAMES_LONG[weekdayIndex(event.date)]}, {longDateLabel(event.date)}
          </div>
          <div className="mob__cardsub">{timeRangeLabel(event.start, event.end)}</div>

          <div style={{ marginTop: 16 }}>
            <div className="sectionlabel">Nerede</div>
            <div className="mob__cardtitle" style={{ marginTop: 7 }}>
              {room ? room.name : 'Oda yok'}
            </div>
            {status === 'pending' && (
              <div className="badge badge--pending" style={{ marginTop: 6 }}>
                <Icon name="clock" size={14} />Onay bekliyor
              </div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="sectionlabel">Kimlerle</div>
            <div className="mob__cardsub" style={{ marginTop: 7 }}>
              {event.participantIds.length + 1} katılımcı
            </div>
          </div>

          {readOnly ? (
            <div className="banner banner--info" style={{ marginTop: 20 }}>
              <Icon name="info" size={14} />
              <span>{owner?.name}’ın paylaştığı takvim</span>
            </div>
          ) : (
            <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
              <Button variant="primary" onClick={() => dispatch({ type: 'saveEvent' })}>Kaydet</Button>
              <Button variant="secondary" onClick={close}>Kapat</Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

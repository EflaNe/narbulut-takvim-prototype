import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { reservationStatusForEvent, roomById } from '../../lib/domain/selectors';
import { canReserveRoom } from '../../lib/domain/rules';
import { Icon } from '../primitives/Icon';
import type { CalendarEvent } from '../../lib/domain/types';

const W = 232;

/**
 * Etkinlik bağlam menüsü — mevcut üründe bulunan sağ tık kalıbının karşılığı.
 * ⚠️ Yalnızca **hızlandırıcıdır**: buradaki her işlem etkinliğe tıklayınca açılan
 * drawer'dan da yapılabilir (`14` BR-SHELL-47). Paylaşılan salt okunur etkinlikte
 * hiç açılmaz (`12` BR-CAL-27).
 */
export function EventContextMenu({ event, x, y, onClose }: {
  event: CalendarEvent; x: number; y: number; onClose: () => void;
}) {
  const state = useAppState();
  const dispatch = useDispatch();

  useEffect(() => {
    const close = () => onClose();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const id = window.setTimeout(() => {
      document.addEventListener('mousedown', close);
      document.addEventListener('contextmenu', close);
    }, 0);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', close);
      document.removeEventListener('contextmenu', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const room = roomById(state, event.roomId);
  const status = reservationStatusForEvent(state, event.id);
  // Seçilebilecek oda yoksa oda aksiyonu anlamsızdır (BR-PRM-08).
  const anyReservable = state.rooms.some(
    (r) => canReserveRoom(r, state.currentUserId, state.groups));

  const left = Math.min(x, window.innerWidth - W - 10);
  const top = Math.min(y, window.innerHeight - 190);

  const run = (fn: () => void) => { onClose(); fn(); };

  return createPortal(
    <div className="ctxmenu" style={{ left, top, width: W }} role="menu"
      aria-label={`${event.title} işlemleri`}>
      <button role="menuitem" onClick={() => run(() =>
        dispatch({ type: 'openEventEdit', eventId: event.id }))}>
        <Icon name="pencil" size={14} />Düzenle
      </button>

      <button role="menuitem" disabled={!anyReservable}
        onClick={() => run(() => {
          dispatch({ type: 'openEventEdit', eventId: event.id });
          dispatch({ type: 'openRoomPicker' });
        })}>
        <Icon name="door" size={14} />{room ? 'Oda değiştir' : 'Oda seç'}
      </button>
      {/* ST-DIS-02 — pasif kontrolün sebebi hover gerektirmeden okunur. */}
      {!anyReservable && (
        <div className="ctxmenu__why">Rezerve edebileceğiniz oda yok.</div>
      )}
      {anyReservable && status === 'pending' && (
        <div className="ctxmenu__why ctxmenu__why--warn">
          Bekleyen talep iptal olur.
        </div>
      )}

      <div className="ctxmenu__sep" />

      <button role="menuitem" className="is-destructive" onClick={() => run(() =>
        dispatch({
          type: 'askConfirm',
          confirm: {
            title: `“${event.title}” silinsin mi?`,
            body: status !== 'none'
              ? `Bu işlem geri alınamaz. ${room?.name ?? 'Oda'} rezervasyonu da iptal edilecek; talep kaydı geçmişte kalır.`
              : 'Bu işlem geri alınamaz.',
            confirmLabel: 'Sil', tone: 'destructive',
            action: { type: 'deleteEvent', eventId: event.id },
          },
        }))}>
        <Icon name="trash" size={14} />Sil
      </button>
    </div>,
    document.body,
  );
}

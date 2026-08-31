import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  calendarById, reservationStatusForEvent, roomById, userById,
} from '../../lib/domain/selectors';
import { DAY_NAMES_LONG, longDateLabel, timeRangeLabel, weekdayIndex } from '../../lib/domain/time';
import { Drawer } from '../overlay/Drawer';
import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';
import { Avatar } from '../primitives/Avatar';

/**
 * Paylaşılan takvim etkinliği — BR-CAL-27 gereği salt okunur.
 * Düzenle / Sil aksiyonu gösterilmez; pasif buton da gösterilmez.
 */
export function ReadOnlyEventDrawer() {
  const state = useAppState();
  const dispatch = useDispatch();
  const event = state.events.find((e) => e.id === state.ui.readOnlyEventId);
  if (!event) return null;

  const cal = calendarById(state, event.calendarId);
  const owner = cal ? userById(state, cal.ownerId) : undefined;
  const room = roomById(state, event.roomId);
  const status = reservationStatusForEvent(state, event.id);
  const participants = event.participantIds
    .map((id) => userById(state, id))
    .filter((u): u is NonNullable<typeof u> => !!u);

  return (
    <Drawer width={520} eyebrow="Etkinlik" onClose={() => dispatch({ type: 'closeEventDrawer' })}
      footer={(
        <>
          <span className="shd__foot">Bu takvim salt okunur paylaşıldı</span>
          <span className="spacer" />
          <Button variant="primary" onClick={() => dispatch({ type: 'closeEventDrawer' })}>Kapat</Button>
        </>
      )}>
      <div className="shd__title">{event.title}</div>
      <div className="evd__meta">
        <span className="calrow__dot" style={{ width: 9, height: 9, background: cal?.color }} />
        {cal?.name}
        <span className="evd__sep">·</span>
        <span className="tnum">
          {DAY_NAMES_LONG[weekdayIndex(event.date)]}, {longDateLabel(event.date)} ·{' '}
          {timeRangeLabel(event.start, event.end)}
        </span>
      </div>

      <div className="evd__section">
        <div className="sectionlabel">Nerede</div>
        <div className="evd__room">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="evd__roomname">{room ? room.name : 'Oda yok'}</div>
            {room && (
              <div className="evd__roommeta">
                {room.capacity} kişilik ·{' '}
                {state.buildings.find((b) => b.id === room.buildingId)?.name}, {room.floor}
              </div>
            )}
          </div>
          {status === 'pending' && (
            <span className="badge badge--pending"><Icon name="clock" size={14} />Onay bekliyor</span>
          )}
        </div>
      </div>

      <div className="evd__section">
        <div className="evd__sectionhead">
          <div className="sectionlabel">Kimlerle</div>
          <span className="evd__count">{participants.length + 1} katılımcı</span>
        </div>
        <div style={{ marginTop: 8 }}>
          {owner && (
            <div className="prow">
              <Avatar user={owner} />
              <span className="prow__name">{owner.name}</span>
              <span className="prow__tag">Organizatör</span>
            </div>
          )}
          {participants.map((p) => (
            <div className="prow" key={p.id}>
              <Avatar user={p} />
              <span className="prow__name">{p.name}</span>
              <span className="prow__tag">{p.title}</span>
            </div>
          ))}
        </div>
      </div>

      {event.notes && (
        <div className="evd__section">
          <div className="sectionlabel">Not</div>
          <div className="evd__roommeta" style={{ marginTop: 9 }}>{event.notes}</div>
        </div>
      )}

      <div className="evd__section" style={{ paddingBottom: 8 }}>
        <div className="banner banner--info">
          <Icon name="info" size={14} />
          <span>{owner?.name}’ın paylaştığı takvim. Bu etkinliği yalnızca görüntüleyebilirsiniz.</span>
        </div>
      </div>
    </Drawer>
  );
}

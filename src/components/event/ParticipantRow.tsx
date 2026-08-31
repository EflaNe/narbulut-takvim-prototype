import { useAppState } from '../../lib/state/StoreContext';
import { overlaps } from '../../lib/domain/time';
import { hhmm } from '../../lib/domain/time';
import { Avatar } from '../primitives/Avatar';
import { Icon } from '../primitives/Icon';
import type { IsoDate, Minutes, User } from '../../lib/domain/types';

interface Props {
  user: User;
  date: IsoDate;
  start: Minutes;
  end: Minutes;
  ignoreEventId?: string;
  onRemove?: () => void;
}

/**
 * Katılımcı satırı. Free/busy yalnız müsait/meşgul gösterir (BR-PRM-11) —
 * çakışan etkinliğin başlığı, odası, katılımcıları gösterilmez.
 */
export function ParticipantRow({ user, date, start, end, ignoreEventId, onRemove }: Props) {
  const state = useAppState();
  const external = user.orgId !== 'narbulut';

  const conflict = external ? null : state.events.find(
    (e) => e.id !== ignoreEventId && e.date === date && overlaps(start, end, e.start, e.end)
      && (e.organizerId === user.id || e.participantIds.includes(user.id)));

  return (
    <div className="prow">
      {external
        ? (
          <span className="avatar" style={{ background: '#F5F7F9' }} aria-hidden="true">
            <Icon name="person" size={14} color="var(--text-muted)" />
          </span>
        )
        : <Avatar user={user} />}
      <span className="prow__name">{external ? user.email : user.name}</span>
      <span className="prow__tag">{external ? 'Harici misafir' : user.title}</span>

      {external ? (
        <span className="prow__status prow__status--unknown">
          <Icon name="info" size={14} />Bilinmiyor
        </span>
      ) : conflict ? (
        <span className="prow__status prow__status--busy">
          <span className="prow__dot" />Meşgul
          <span className="prow__time">{hhmm(conflict.start)} – {hhmm(conflict.end)}</span>
        </span>
      ) : (
        <span className="prow__status prow__status--free">
          <Icon name="check" size={14} />Müsait
        </span>
      )}

      {onRemove && (
        <button className="prow__remove" onClick={onRemove}
          aria-label={`${user.name} katılımcılardan çıkar`}>
          <Icon name="close" size={13} />
        </button>
      )}
    </div>
  );
}

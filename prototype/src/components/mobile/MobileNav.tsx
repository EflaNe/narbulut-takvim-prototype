import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { decidableRequests } from '../../lib/domain/selectors';
import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/Icon';
import type { Route } from '../../lib/state/types';

/**
 * Mobil alt gezinme — D-074. Masaüstündeki dört bölümün karşılığı.
 * ⚠️ Önceki hâlde İzinler'e mobilden **ulaşılamıyordu**; alt çubukta yalnız
 * "Yeni etkinlik" ve "Odalar" vardı.
 */
const items: { route: Route; label: string; icon: IconName }[] = [
  { route: 'calendar', label: 'Takvim', icon: 'calendar' },
  { route: 'permissions', label: 'İzinler', icon: 'list' },
  { route: 'rooms', label: 'Odalar', icon: 'building' },
  { route: 'requests', label: 'Talepler', icon: 'clock' },
];

export function MobileNav() {
  const state = useAppState();
  const dispatch = useDispatch();
  const pending = decidableRequests(state).length;

  return (
    <nav className="mnav" aria-label="Ana gezinme">
      {items.map((it) => {
        const active = state.ui.route === it.route;
        return (
          <button key={it.route} className={active ? 'is-active' : undefined}
            aria-current={active ? 'page' : undefined}
            onClick={() => dispatch({ type: 'navigate', route: it.route })}>
            <span className="mnav__ico">
              <Icon name={it.icon} size={21}
                color={active ? 'var(--brand)' : 'var(--text-tertiary)'} />
              {it.route === 'requests' && pending > 0 && (
                <span className="mnav__count">{pending}</span>
              )}
            </span>
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}

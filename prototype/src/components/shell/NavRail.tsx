import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/Icon';
import type { Route } from '../../lib/state/types';

const items: { route: Route; label: string; icon: IconName }[] = [
  { route: 'calendar', label: 'Takvim', icon: 'calendar' },
  { route: 'permissions', label: 'İzinler', icon: 'list' },
  { route: 'rooms', label: 'Odalar', icon: 'building' },
];

export function NavRail() {
  const { ui } = useAppState();
  const dispatch = useDispatch();
  return (
    <nav className="navrail" aria-label="Ana gezinme">
      {items.map((it) => {
        const active = ui.route === it.route
          || (it.route === 'calendar' && ui.route === 'requests');
        return (
          <button key={it.route} className={active ? 'is-active' : undefined}
            aria-current={active ? 'page' : undefined}
            onClick={() => dispatch({ type: 'navigate', route: it.route })}>
            <Icon name={it.icon} size={15} color={active ? 'var(--brand)' : 'var(--text-tertiary)'} />
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}

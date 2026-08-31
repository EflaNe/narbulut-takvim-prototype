import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { DAY_NAMES_LONG, MONTH_NAMES, fromIso, weekdayIndex } from '../../lib/domain/time';
import { IconButton } from '../primitives/IconButton';

export function DateHero() {
  const { today, ui } = useAppState();
  const dispatch = useDispatch();
  // Kart bugünün tarihini gösterir (canonical 01).
  const d = fromIso(today);
  const isThisWeek = ui.anchorDate >= today.slice(0, 10)
    && Math.abs(fromIso(ui.anchorDate).getTime() - d.getTime()) < 7 * 864e5;

  return (
    <div className="datehero">
      <span className="datehero__blob1" aria-hidden="true" />
      <span className="datehero__blob2" aria-hidden="true" />
      <div className="datehero__dow">{DAY_NAMES_LONG[weekdayIndex(today)]}</div>
      <div className="datehero__day">{d.getDate()}</div>
      <div className="datehero__month">{MONTH_NAMES[d.getMonth()]} {d.getFullYear()}</div>
      <div className="datehero__row">
        <button className="datehero__today" onClick={() => dispatch({ type: 'goToday' })}
          aria-pressed={isThisWeek}>Bugün</button>
        <span className="spacer" />
        <IconButton icon="chevronLeft" label="Önceki hafta" tone="onBrand"
          onClick={() => dispatch({ type: 'shiftWeek', delta: -1 })} />
        <IconButton icon="chevronRight" label="Sonraki hafta" tone="onBrand"
          onClick={() => dispatch({ type: 'shiftWeek', delta: 1 })} />
      </div>
    </div>
  );
}

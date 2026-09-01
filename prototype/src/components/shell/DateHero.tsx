import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  DAY_NAMES_LONG, MONTH_NAMES, fromIso, stepLabel, weekDates, weekdayIndex,
} from '../../lib/domain/time';
import { IconButton } from '../primitives/IconButton';

/**
 * Tarih kartı **bakılan konumu** gösterir, sabit "bugün"ü değil.
 * Kart hem "neredeyim" göstergesi hem navigasyon aracıdır: `Bugün` bugüne döner,
 * oklar aktif görünüm moduna göre ilerletir (`14` BR-SHELL-01/03).
 */
export function DateHero() {
  const { today, ui } = useAppState();
  const dispatch = useDispatch();
  const d = fromIso(ui.anchorDate);
  const step = stepLabel(ui.viewMode);

  // Bugün, görünen aralıkta mı? Haftalık görünümde hafta, diğerlerinde gün karşılaştırılır.
  const showingToday = ui.viewMode === 'week'
    ? weekDates(ui.anchorDate).includes(today)
    : ui.anchorDate === today;

  return (
    <div className="datehero">
      <span className="datehero__blob1" aria-hidden="true" />
      <span className="datehero__blob2" aria-hidden="true" />
      <div className="datehero__dow">{DAY_NAMES_LONG[weekdayIndex(ui.anchorDate)]}</div>
      <div className="datehero__day">{d.getDate()}</div>
      <div className="datehero__month">{MONTH_NAMES[d.getMonth()]} {d.getFullYear()}</div>
      <div className="datehero__row">
        <button className={`datehero__today${showingToday ? ' is-on' : ''}`}
          onClick={() => dispatch({ type: 'goToday' })}
          aria-pressed={showingToday}>Bugün</button>
        <span className="spacer" />
        <IconButton icon="chevronLeft" label={`Önceki ${step}`} tone="onBrand"
          onClick={() => dispatch({ type: 'shiftView', delta: -1 })} />
        <IconButton icon="chevronRight" label={`Sonraki ${step}`} tone="onBrand"
          onClick={() => dispatch({ type: 'shiftView', delta: 1 })} />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import {
  DAY_NAMES_MINI, addDays, dayOfMonth, isWeekend, monthLabel, monthMatrix, sameMonth,
  startOfWeek,
} from '../../lib/domain/time';
import { IconButton } from '../primitives/IconButton';

export function MiniMonth() {
  const { today, ui } = useAppState();
  const dispatch = useDispatch();
  const [cursor, setCursor] = useState(ui.anchorDate);
  const weeks = monthMatrix(cursor);
  const currentWeekStart = startOfWeek(ui.anchorDate);

  return (
    <div className="minimonth">
      <div className="minimonth__head">
        <span className="minimonth__label">{monthLabel(cursor)}</span>
        <span className="spacer" />
        <IconButton icon="chevronLeft" label="Önceki ay" tone="sm" size={15}
          onClick={() => setCursor(addDays(`${cursor.slice(0, 8)}01`, -1))} />
        <IconButton icon="chevronRight" label="Sonraki ay" tone="sm" size={15}
          onClick={() => setCursor(addDays(`${cursor.slice(0, 8)}28`, 7))} />
      </div>
      <div className="minimonth__dow" aria-hidden="true">
        {DAY_NAMES_MINI.map((d) => <span key={d}>{d}</span>)}
      </div>
      {weeks.map((week) => (
        <div key={week[0]}
          className={`minimonth__week${week[0] === currentWeekStart ? ' is-current' : ''}`}>
          {week.map((date) => {
            const out = !sameMonth(date, cursor);
            const cls = [
              'minimonth__day',
              out ? 'is-out' : isWeekend(date) ? 'is-weekend' : '',
              date === today ? 'is-today' : '',
            ].filter(Boolean).join(' ');
            return (
              <button key={date} className={cls} type="button"
                aria-label={date} aria-current={date === today ? 'date' : undefined}
                onClick={() => dispatch({ type: 'setAnchorDate', date })}>
                {dayOfMonth(date)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { calendarById, eventsForDate, isSharedEvent } from '../../lib/domain/selectors';
import { DAY_NAMES_SHORT, dayOfMonth, hhmm, isWeekend, monthMatrix, sameMonth } from '../../lib/domain/time';

export function MonthGrid() {
  const state = useAppState();
  const dispatch = useDispatch();
  const weeks = monthMatrix(state.ui.anchorDate);

  return (
    <div className="monthgrid">
      <div className="monthgrid__dow">
        {DAY_NAMES_SHORT.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="monthgrid__weeks">
        {weeks.map((week) => (
          <div className="monthgrid__week" key={week[0]}>
            {week.map((date) => {
              const evs = eventsForDate(state, date);
              const out = !sameMonth(date, state.ui.anchorDate);
              return (
                <button key={date}
                  className={`monthgrid__cell${out ? ' is-out' : isWeekend(date) ? ' is-weekend' : ''}`}
                  onClick={() => {
                    dispatch({ type: 'setAnchorDate', date });
                    dispatch({ type: 'setViewMode', mode: 'day' });
                  }}>
                  <span className={`monthgrid__num${out ? ' is-out' : ''}${date === state.today ? ' is-today' : ''}`}>
                    {dayOfMonth(date)}
                  </span>
                  {evs.slice(0, 3).map((e) => {
                    const cal = calendarById(state, e.calendarId);
                    return (
                      <span key={e.id} className="monthchip" style={{ background: cal?.color }}
                        title={isSharedEvent(state, e) ? `${e.title} · paylaşılan` : e.title}>
                        {hhmm(e.start)} {e.title}
                      </span>
                    );
                  })}
                  {evs.length > 3 && (
                    <span className="monthgrid__more">+{evs.length - 3} daha</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

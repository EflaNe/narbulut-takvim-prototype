import { useRef } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { eventsForDate, layoutDay } from '../../lib/domain/selectors';
import {
  DAY_NAMES_SHORT, GRID_END_H, GRID_START_H, HOUR_H, WORK_END_H, WORK_START_H,
  dayOfMonth, hourSlots, isWeekend, minutesToY, weekDates, weekdayIndex,
} from '../../lib/domain/time';
import { EventBlock } from './EventBlock';

export function WeekGrid() {
  const state = useAppState();
  const dispatch = useDispatch();
  const days = weekDates(state.ui.anchorDate);
  const canvasRef = useRef<HTMLDivElement>(null);
  const todayIndex = days.indexOf(state.today);
  const colPct = 100 / 7;

  const onSlot = (date: string, hour: number, e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    dispatch({
      type: 'openQuickCreate',
      date, start: hour * 60, end: hour * 60 + 60,
      x: rect ? e.clientX - rect.left : 0,
      y: rect ? e.clientY - rect.top : 0,
    });
  };

  return (
    <div className="weekview">
      <div className="dayhead">
        <div className="dayhead__gutter" />
        <div className="dayhead__days">
          {days.map((date) => {
            const wk = isWeekend(date);
            const today = date === state.today;
            return (
              <div key={date} className={`dayhead__cell${wk ? ' is-weekend' : ''}`}>
                <div className={`dayhead__dow${today ? ' is-today' : wk ? ' is-weekend' : ''}`}>
                  {DAY_NAMES_SHORT[weekdayIndex(date)]}
                </div>
                <div className={`dayhead__num${today ? ' is-today' : wk ? ' is-weekend' : ''}`}>
                  {dayOfMonth(date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="gridwrap">
        <div className="grid" style={{ height: (GRID_END_H - GRID_START_H) * HOUR_H }}>
          <div className="grid__gutter">
            {hourSlots().map((h) => (
              <div className="grid__hour" key={h}>{String(h).padStart(2, '0')}:00</div>
            ))}
          </div>

          <div className="grid__canvas" ref={canvasRef}>
            {/* Çalışma saatleri dışı bantlar */}
            <div className="grid__offhours" style={{ top: 0, height: minutesToY(WORK_START_H * 60) }} />
            <div className="grid__offhours"
              style={{ top: minutesToY(WORK_END_H * 60), bottom: 0 }} />

            {todayIndex >= 0 && (
              <div className="grid__todaycol"
                style={{ left: `${todayIndex * colPct}%`, width: `${colPct}%` }} />
            )}
            <div className="grid__weekendcol" style={{ left: `${5 * colPct}%`, right: 0 }} />

            <div className="grid__days">
              {days.map((date) => {
                const laid = layoutDay(eventsForDate(state, date));
                return (
                  <div className="grid__day" key={date}>
                    {hourSlots().map((h) => (
                      <button key={h} className="grid__slot" type="button"
                        style={{ top: (h - GRID_START_H) * HOUR_H }}
                        aria-label={`${date} ${String(h).padStart(2, '0')}:00 — yeni etkinlik`}
                        onClick={(e) => onSlot(date, h, e)} />
                    ))}
                    {laid.map(({ event, columnIndex, columnCount }) => (
                      <EventBlock key={event.id} event={event}
                        columnIndex={columnIndex} columnCount={columnCount} />
                    ))}
                  </div>
                );
              })}
            </div>

            {todayIndex >= 0 && (
              <div className="grid__now" style={{ top: minutesToY(state.nowMinutes) }} aria-hidden="true">
                <span style={{ left: `${todayIndex * colPct}%` }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

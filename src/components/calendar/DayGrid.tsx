import { useRef } from 'react';
import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { eventsForDate, layoutDay } from '../../lib/domain/selectors';
import {
  DAY_NAMES_LONG, GRID_END_H, GRID_START_H, HOUR_H, WORK_END_H, WORK_START_H,
  hourSlots, longDateLabel, minutesToY, weekdayIndex,
} from '../../lib/domain/time';
import { EventBlock } from './EventBlock';

export function DayGrid() {
  const state = useAppState();
  const dispatch = useDispatch();
  const date = state.ui.anchorDate;
  const laid = layoutDay(eventsForDate(state, date));
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div className="weekview">
      <div className="dayview__head">
        <span className="dayview__title">{DAY_NAMES_LONG[weekdayIndex(date)]}</span>
        <span className="dayview__sub">{longDateLabel(date)}</span>
        <span className="spacer" />
        <span className="dayview__sub">{laid.length} etkinlik</span>
      </div>
      <div className="gridwrap">
        <div className="grid" style={{ height: (GRID_END_H - GRID_START_H) * HOUR_H }}>
          <div className="grid__gutter">
            {hourSlots().map((h) => (
              <div className="grid__hour" key={h}>{String(h).padStart(2, '0')}:00</div>
            ))}
          </div>
          <div className="grid__canvas" ref={canvasRef}>
            <div className="grid__offhours" style={{ top: 0, height: minutesToY(WORK_START_H * 60) }} />
            <div className="grid__offhours" style={{ top: minutesToY(WORK_END_H * 60), bottom: 0 }} />
            <div className="grid__day" style={{ position: 'absolute', inset: 0, borderRight: 'none' }}>
              {hourSlots().map((h) => (
                <button key={h} className="grid__slot" type="button"
                  style={{ top: (h - GRID_START_H) * HOUR_H }}
                  aria-label={`${date} ${String(h).padStart(2, '0')}:00 — yeni etkinlik`}
                  onClick={(e) => {
                    const rect = canvasRef.current?.getBoundingClientRect();
                    dispatch({
                      type: 'openQuickCreate', date, start: h * 60, end: h * 60 + 60,
                      x: rect ? e.clientX - rect.left : 0, y: rect ? e.clientY - rect.top : 0,
                    });
                  }} />
              ))}
              {laid.map(({ event, columnIndex, columnCount }) => (
                <EventBlock key={event.id} event={event}
                  columnIndex={columnIndex} columnCount={columnCount} />
              ))}
            </div>
            {date === state.today && (
              <div className="grid__now" style={{ top: minutesToY(state.nowMinutes) }} aria-hidden="true">
                <span style={{ left: 0 }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

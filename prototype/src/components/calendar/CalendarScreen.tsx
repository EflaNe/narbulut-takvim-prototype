import { useAppState } from '../../lib/state/StoreContext';
import { myCalendars, mySharedCalendars, isCalendarVisible } from '../../lib/domain/selectors';
import { TopBar } from './TopBar';
import { WeekGrid } from './WeekGrid';
import { DayGrid } from './DayGrid';
import { MonthGrid } from './MonthGrid';
import { RoomsGrid } from './RoomsGrid';
import { QuickCreatePopover } from './QuickCreatePopover';
import { EmptyGridState } from './EmptyGridState';

export function CalendarScreen() {
  const state = useAppState();
  const anyVisible = [
    ...myCalendars(state).map((c) => c.id),
    ...mySharedCalendars(state).map((s) => s.calendar.id),
  ].some((id) => isCalendarVisible(state, id));

  return (
    <div className="main">
      <TopBar />
      {!anyVisible ? <EmptyGridState /> : (
        <>
          {state.ui.viewMode === 'week' && <WeekGrid />}
          {state.ui.viewMode === 'day' && <DayGrid />}
          {state.ui.viewMode === 'month' && <MonthGrid />}
          {state.ui.viewMode === 'byRoom' && <RoomsGrid />}
        </>
      )}
      <QuickCreatePopover />
    </div>
  );
}

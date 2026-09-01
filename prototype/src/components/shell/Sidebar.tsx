import { NavRail } from './NavRail';
import { DateHero } from './DateHero';
import { MiniMonth } from './MiniMonth';
import { OwnedCalendarList, SharedCalendarList } from './CalendarList';
import { RoomsFilterCard } from './RoomsFilterCard';

export function Sidebar() {
  return (
    <div className="sidebar">
      <NavRail />
      <DateHero />
      <MiniMonth />
      <OwnedCalendarList />
      <SharedCalendarList />
      <RoomsFilterCard />
    </div>
  );
}

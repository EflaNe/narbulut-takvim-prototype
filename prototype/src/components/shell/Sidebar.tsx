import { NavRail } from './NavRail';
import { DateHero } from './DateHero';
import { MiniMonth } from './MiniMonth';
import { OwnedCalendarList, SharedCalendarList } from './CalendarList';
import { FiltersCard } from './FiltersCard';

export function Sidebar() {
  return (
    <div className="sidebar">
      <NavRail />
      <DateHero />
      <MiniMonth />
      <OwnedCalendarList />
      <SharedCalendarList />
      <FiltersCard />
    </div>
  );
}

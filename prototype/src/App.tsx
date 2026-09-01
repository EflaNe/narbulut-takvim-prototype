import { useAppState } from './lib/state/StoreContext';
import { useMediaQuery } from './lib/useMediaQuery';
import { Sidebar } from './components/shell/Sidebar';
import { RoomsSidebar } from './components/admin/RoomsSidebar';
import { CalendarScreen } from './components/calendar/CalendarScreen';
import { PermissionsScreen } from './components/admin/PermissionsScreen';
import { RoomsScreen } from './components/admin/RoomsScreen';
import { RequestsScreen } from './components/requests/RequestsScreen';
import { EventDrawer } from './components/event/EventDrawer';
import { ReadOnlyEventDrawer } from './components/event/ReadOnlyEventDrawer';
import { RoomPickerDrawer } from './components/room/RoomPickerDrawer';
import { ShareDrawer } from './components/sharing/ShareDrawer';
import { ConfirmDialog } from './components/overlay/ConfirmDialog';
import { Toast } from './components/primitives/Toast';
import { DemoPanel } from './components/shell/DemoPanel';
import { MobileApp } from './components/mobile/MobileApp';

export function App() {
  const state = useAppState();
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (isMobile) {
    return (
      <>
        {state.ui.route === 'calendar' ? <MobileApp /> : (
          <div className="app app--mobileroute">
            {state.ui.route === 'permissions' && <PermissionsScreen />}
            {state.ui.route === 'rooms' && <RoomsScreen />}
            {state.ui.route === 'requests' && <RequestsScreen />}
          </div>
        )}
        {state.ui.draft && !state.ui.roomPickerOpen && state.ui.route !== 'calendar' && <EventDrawer />}
        <ConfirmDialog />
        <Toast />
        <DemoPanel />
      </>
    );
  }

  return (
    <div className="app">
      {state.ui.route === 'rooms' ? <RoomsSidebar /> : <Sidebar />}
      {state.ui.route === 'calendar' && <CalendarScreen />}
      {state.ui.route === 'permissions' && <PermissionsScreen />}
      {state.ui.route === 'rooms' && <RoomsScreen />}
      {state.ui.route === 'requests' && <RequestsScreen />}

      {state.ui.draft && <EventDrawer dimmed={state.ui.roomPickerOpen} />}
      {state.ui.roomPickerOpen && state.ui.draft && <RoomPickerDrawer />}
      {state.ui.readOnlyEventId && <ReadOnlyEventDrawer />}
      {state.ui.shareCalendarId && <ShareDrawer />}

      <ConfirmDialog />
      <Toast />
      <DemoPanel />
    </div>
  );
}

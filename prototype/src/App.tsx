import { useEffect } from 'react';
import { useAppState, useDispatch } from './lib/state/StoreContext';
import { useMediaQuery } from './lib/useMediaQuery';
import { Sidebar } from './components/shell/Sidebar';
import { RoomsSidebar } from './components/admin/RoomsSidebar';
import { PermissionsSidebar } from './components/admin/PermissionsSidebar';
import { RequestsSidebar } from './components/requests/RequestsSidebar';
import { CalendarScreen } from './components/calendar/CalendarScreen';
import { PermissionsScreen } from './components/admin/PermissionsScreen';
import { RoomsScreen } from './components/admin/RoomsScreen';
import { RequestsScreen } from './components/requests/RequestsScreen';
import { EventDrawer } from './components/event/EventDrawer';
import { ReadOnlyEventDrawer } from './components/event/ReadOnlyEventDrawer';
import { RoomPickerDrawer } from './components/room/RoomPickerDrawer';
import { ShareDrawer } from './components/sharing/ShareDrawer';
import { ConfirmDialog } from './components/overlay/ConfirmDialog';
import { CalendarDeleteDialog, CalendarFormDialog } from './components/shell/CalendarDialogs';
import { Toast } from './components/primitives/Toast';
import { DemoPanel } from './components/shell/DemoPanel';
import { MobileApp } from './components/mobile/MobileApp';
import { MobileRooms } from './components/mobile/MobileRooms';
import { MobilePermissions } from './components/mobile/MobilePermissions';
import { MobileRequests } from './components/mobile/MobileRequests';
import { LoginScreen } from './components/demo/LoginScreen';
import { DemoBanner } from './components/demo/DemoBanner';
import { PERSONAS } from './components/demo/personas';

export function App() {
  const state = useAppState();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery('(max-width: 767px)');

  /* Doğrudan bağlantı: ?p=deniz giriş ekranını atlar. Ekran görüntüsü ve
     "abi, sen Zeynep olarak gir" gibi paylaşımlar için. */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const key = q.get('p');
    if (!key) return;
    const match = PERSONAS.find((x) => x.id === `usr_${key}` || x.id === key);
    if (match) dispatch({ type: 'signIn', userId: match.id });
    if (q.get('banner') === 'off') dispatch({ type: 'dismissDemoBanner' });
  }, [dispatch]);

  if (!state.ui.signedIn) return <LoginScreen />;

  if (isMobile) {
    return (
      <div className="demoshell">
        <DemoBanner />
        {/* D-074 — üç yönetim ekranının mobil yerleşimi artık kendi bileşenlerinde;
            önceki hâlde masaüstü yerleşimi 390px'e sıkışıyordu. */}
        {state.ui.route === 'calendar' && <MobileApp />}
        {state.ui.route === 'permissions' && <MobilePermissions />}
        {state.ui.route === 'rooms' && <MobileRooms />}
        {state.ui.route === 'requests' && <MobileRequests />}
        {state.ui.draft && !state.ui.roomPickerOpen && state.ui.route !== 'calendar' && <EventDrawer />}
        <CalendarFormDialog />
        <CalendarDeleteDialog />
        <ConfirmDialog />
        <Toast />
        <DemoPanel />
      </div>
    );
  }

  return (
    <div className="demoshell">
      <DemoBanner />
      <div className="app">
      {/* D-074 — her yönetim ekranı kendi rail'ini kurar; sabit olan genişlik ve dil. */}
      {state.ui.route === 'rooms' ? <RoomsSidebar />
        : state.ui.route === 'permissions' ? <PermissionsSidebar />
          : state.ui.route === 'requests' ? <RequestsSidebar />
            : <Sidebar />}
      {state.ui.route === 'calendar' && <CalendarScreen />}
      {state.ui.route === 'permissions' && <PermissionsScreen />}
      {state.ui.route === 'rooms' && <RoomsScreen />}
      {state.ui.route === 'requests' && <RequestsScreen />}

      {state.ui.draft && <EventDrawer dimmed={state.ui.roomPickerOpen} />}
      {state.ui.roomPickerOpen && state.ui.draft && <RoomPickerDrawer />}
      {state.ui.readOnlyEventId && <ReadOnlyEventDrawer />}
      {state.ui.shareCalendarId && <ShareDrawer />}

      <CalendarFormDialog />
      <CalendarDeleteDialog />
      <ConfirmDialog />
      <Toast />
      <DemoPanel />
      </div>
    </div>
  );
}

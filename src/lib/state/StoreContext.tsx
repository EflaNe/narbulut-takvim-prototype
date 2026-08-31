import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { createInitialState, reducer } from './reducer';
import type { AppAction, AppState } from './types';

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<Dispatch<AppAction> | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  // Demo paneli — sunum arayüzünde görünmez, yalnız Shift+D ile açılır.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd') && !e.metaKey && !e.ctrlKey) {
        const t = e.target as HTMLElement | null;
        if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
        e.preventDefault();
        dispatch({ type: 'toggleDemoPanel' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): AppState {
  const s = useContext(StateContext);
  if (!s) throw new Error('useAppState must be used within StoreProvider');
  return s;
}

export function useDispatch(): Dispatch<AppAction> {
  const d = useContext(DispatchContext);
  if (!d) throw new Error('useDispatch must be used within StoreProvider');
  return d;
}

export function useCurrentUser() {
  const s = useAppState();
  return useMemo(
    () => s.users.find((u) => u.id === s.currentUserId)!,
    [s.users, s.currentUserId],
  );
}

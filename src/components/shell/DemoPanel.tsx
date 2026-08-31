import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import type { UserId } from '../../lib/domain/types';

/**
 * Sunum arayüzünde görünmez. Yalnız Shift+D ile açılır.
 * Amaç: self-approval yasağı (BR-APR-17a) nedeniyle kendi talebini onaylayamayan
 * sunucunun, onaylayıcı personasına geçip akışı tamamlayabilmesi.
 */
export function DemoPanel() {
  const state = useAppState();
  const dispatch = useDispatch();
  if (!state.ui.demoPanelOpen) return null;

  const personas: UserId[] = ['usr_deniz', 'usr_zeynep', 'usr_ahmet', 'usr_mert'];

  return (
    <div className="demopanel" role="dialog" aria-label="Demo kontrolleri">
      <h4>Demo kontrolleri</h4>
      <label htmlFor="persona" style={{ display: 'block', marginBottom: 5 }}>Persona</label>
      <select id="persona" value={state.currentUserId}
        onChange={(e) => dispatch({ type: 'setPersona', userId: e.target.value as UserId })}>
        {personas.map((id) => {
          const u = state.users.find((x) => x.id === id)!;
          return <option key={id} value={id}>{u.name} — {u.title}</option>;
        })}
      </select>
      <button onClick={() => dispatch({ type: 'resetDemo' })}>Demoyu başa al</button>
      <p>Shift+D ile açılır/kapanır. Sunum arayüzünün parçası değildir.</p>
    </div>
  );
}

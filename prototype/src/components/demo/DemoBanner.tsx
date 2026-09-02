import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { Icon } from '../primitives/Icon';

/** Üstteki bilgi şeridi — prototipin gerçek ürün sanılmasını engeller. */
export function DemoBanner() {
  const { ui } = useAppState();
  const dispatch = useDispatch();
  if (!ui.demoBannerOpen) return null;
  return (
    <div className="demoband" role="note">
      <span className="demoband__dot" aria-hidden="true" />
      <strong>Tasarım prototipi</strong>
      <span className="demoband__sep">·</span>
      <span>veriler örnektir, backend yoktur</span>
      <span className="demoband__sep">·</span>
      <span>sayfayı yenilemek her şeyi sıfırlar</span>
      <button className="demoband__x" aria-label="Bilgi şeridini kapat"
        onClick={() => dispatch({ type: 'dismissDemoBanner' })}>
        <Icon name="close" size={13} />
      </button>
    </div>
  );
}

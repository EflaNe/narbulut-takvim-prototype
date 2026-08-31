import { useDispatch } from '../../lib/state/StoreContext';
import { Button } from '../primitives/Button';

/** BR-CAL-20 / ST-EMPTY-02 — filtre kaynaklı boş durum sebebini söyler. */
export function EmptyGridState() {
  const dispatch = useDispatch();
  return (
    <div className="emptystate">
      <div className="emptystate__title">Tüm takvimler kapalı</div>
      <div className="emptystate__body">
        Izgara boş görünüyor çünkü sol menüdeki takvimlerin tümünü kapattınız.
        Bu bir hata değildir.
      </div>
      <Button variant="outline" size="sm"
        onClick={() => dispatch({ type: 'toast', message: 'Sol menüden bir takvimi yeniden açın.' })}>
        Nasıl düzeltirim?
      </Button>
    </div>
  );
}

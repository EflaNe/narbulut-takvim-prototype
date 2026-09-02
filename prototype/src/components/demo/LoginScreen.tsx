import { useAppState, useDispatch } from '../../lib/state/StoreContext';
import { userById } from '../../lib/domain/selectors';
import { Icon } from '../primitives/Icon';
import { PERSONAS, TEST_STEPS } from './personas';

/** **Markdown benzeri `**kalın**` işaretlerini render eder.* */
function rich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  ));
}

/**
 * Demo giriş ekranı.
 * ⚠️ **Kimlik doğrulama değildir.** Backend olmadığı için gerçek oturum açma
 * mümkün değil; bu ekran yalnızca test edilecek personayı seçtirir.
 */
export function LoginScreen() {
  const state = useAppState();
  const dispatch = useDispatch();

  return (
    <div className="login">
      <div className="login__inner">
        <header className="login__head">
          <div className="login__brand">Narbulut Takvim</div>
          <h1 className="login__title">Tasarım prototipi</h1>
          <p className="login__sub">
            Bu bir demo ortamıdır. Veriler örnektir, backend yoktur ve sayfayı yenilemek
            her şeyi başlangıç durumuna döndürür.
          </p>
        </header>

        <div className="login__cols">
          <section aria-labelledby="persona-h">
            <div className="login__label" id="persona-h">Kim olarak girmek istersiniz?</div>
            {PERSONAS.map((p) => {
              const u = userById(state, p.id);
              if (!u) return null;
              return (
                <button className="persona" key={p.id}
                  onClick={() => dispatch({ type: 'signIn', userId: p.id })}>
                  <span className="persona__av" style={{ background: p.color }}>{u.initials}</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span className="persona__name" style={{ display: 'block' }}>{u.name}</span>
                    <span className="persona__role" style={{ display: 'block' }}>{u.title}</span>
                    <span className="persona__can" style={{ display: 'block' }}>{p.can}</span>
                  </span>
                  <span className="persona__go"><Icon name="arrowRight" size={16} /></span>
                </button>
              );
            })}
          </section>

          <aside className="login__panel">
            <div className="login__label">Neyi test edebilirsiniz</div>
            <ol className="login__steps">
              {TEST_STEPS.map((s) => <li key={s}>{rich(s)}</li>)}
            </ol>
            <div className="login__note">
              Persona’yı sol rail’in altındaki <strong>DEMO</strong> satırından istediğiniz an
              değiştirebilirsiniz — girdiğiniz veriler korunur.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

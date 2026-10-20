import useTitrePage from '../../hooks/useTitrePage';
import LOGO from '../../assets/images/logo-saambiz.png';
import useChangementMotDePasse, { CHAMPS } from './useChangementMotDePasse';

/** Écran imposé tant que le mot de passe temporaire n'a pas été remplacé. */
export default function ChangePasswordPage() {
  useTitrePage('Changement de mot de passe — SaamBiz Admin');
  const c = useChangementMotDePasse();

  return (
    <>
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo-row">
            <img className="login-logo-img" src={LOGO} alt="SaamBiz" />
            <div className="login-brand-sub">Administration</div>
          </div>
          <div className="login-divider" />

          <div className="change-pwd-banner">
            <strong>Première connexion détectée</strong>
            <p>
              Pour des raisons de sécurité, vous devez définir votre propre mot de passe
              avant de continuer.
            </p>
          </div>

          <form onSubmit={c.soumettre}>
            {CHAMPS.map(({ nom, label, placeholder }) => (
              <div className="form-field" key={nom}>
                <label className="form-label" htmlFor={nom}>{label}</label>
                <input
                  id={nom} name={nom} type="password"
                  className={`form-input${c.erreurs[nom] ? ' input-error' : ''}`}
                  placeholder={placeholder}
                  value={c.formulaire[nom]}
                  onChange={c.changerChamp}
                  autoComplete="new-password"
                  required
                />
                {c.erreurs[nom] && <div className="form-error">{c.erreurs[nom]}</div>}
              </div>
            ))}

            <button className="login-btn" type="submit" disabled={c.enregistrement}>
              {c.enregistrement ? (
                <>
                  <div className="spinner spinner-sm spinner-clair" />
                  Enregistrement…
                </>
              ) : 'Définir mon mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

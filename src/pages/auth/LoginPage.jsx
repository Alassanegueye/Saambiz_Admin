import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useTitrePage from '../../hooks/useTitrePage';
import { ROUTES, URL_ESPACE_VENDEUR } from '../../constants/routes';
import useLoginForm from '../../hooks/useLoginForm';
import PICTO from '../../assets/images/picto-saambiz.png';

/**
 * Connexion de l'administration.
 *
 * Réservée aux comptes Admin et SuperAdmin : un vendeur qui atterrit ici est
 * renvoyé vers son propre écran de connexion plutôt que refusé sèchement.
 * Volontairement sobre — c'est un back-office interne, pas une vitrine.
 */
export default function LoginPage() {
  useTitrePage('Administration — SaamBiz');
  const navigate = useNavigate();

  const { email, setEmail, password, setPassword, loading, frozen, countdown, handleSubmit } =
    useLoginForm((utilisateur) => {
      if (utilisateur.role === 'Vendeur') {
        // L'espace vendeur est une application distincte : on quitte
        // l'administration au lieu de naviguer dans une route qui n'existe
        // plus ici.
        toast.info('Votre espace vendeur se trouve à une autre adresse.');
        window.location.href = URL_ESPACE_VENDEUR;
        return;
      }
      if (utilisateur.role !== 'Admin' && utilisateur.role !== 'SuperAdmin') {
        return "Ce portail est réservé à l'administration.";
      }
      toast.success('Connexion réussie !');
      navigate(ROUTES.DASHBOARD, { replace: true });
    });

  return (
    <>
      <div className="login-page login-page-admin">
        <div className="login-admin-card">
          <div className="login-admin-head">
            <img src={PICTO} alt="SaamBiz" />
            <div>
              <div className="login-form-title">Administration</div>
              <div className="login-form-sub">Accès réservé à l&apos;équipe SaamBiz</div>
            </div>
          </div>

          {frozen && (
            <div className="login-freeze-banner">
              Trop de tentatives — réessayez dans <strong>{countdown}s</strong>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="form-input"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={frozen}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={frozen}
              />
            </div>

            <button className="login-btn" type="submit" disabled={loading || frozen}>
              {loading ? (
                <>
                  <div className="spinner spinner-sm spinner-clair" />
                  Connexion…
                </>
              ) : frozen ? `Attente ${countdown}s...` : 'Se connecter'}
            </button>
          </form>

          <p className="login-foot">
            Vous êtes vendeur ?{' '}
            <a href={URL_ESPACE_VENDEUR} className="login-lien">Accéder à votre boutique</a>
          </p>
        </div>
      </div>
    </>
  );
}

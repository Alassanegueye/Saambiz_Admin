/** Changement de mot de passe du compte connecté. */
export default function FormulaireMotDePasse({
  mdp, majChampMdp, erreur, enCours, longueurMinimale, onSubmit,
}) {
  return (
    <form className="card" onSubmit={onSubmit}>
      <div className="card-header"><h2 className="card-title">Mot de passe</h2></div>
      <div className="card-body">
        <div className="form-field">
          <label className="form-label" htmlFor="p-ancien">Mot de passe actuel</label>
          <input id="p-ancien" type="password" className="form-input" value={mdp.ancien}
                 onChange={majChampMdp('ancien')} autoComplete="current-password" required />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="p-nouveau">Nouveau mot de passe</label>
          <input id="p-nouveau" type="password" className="form-input" value={mdp.nouveau}
                 onChange={majChampMdp('nouveau')} autoComplete="new-password" required />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="p-confirm">
            Confirmer le nouveau mot de passe
          </label>
          <input id="p-confirm" type="password" className="form-input" value={mdp.confirmation}
                 onChange={majChampMdp('confirmation')} autoComplete="new-password" required />
          {erreur && <span className="form-error">{erreur}</span>}
        </div>
        <p className="profil-aide">
          {longueurMinimale} caractères minimum, avec majuscule, minuscule, chiffre et
          caractère spécial.
        </p>
        <button type="submit" className="btn btn-secondary" disabled={enCours}>
          {enCours ? 'Modification…' : 'Changer le mot de passe'}
        </button>
      </div>
    </form>
  );
}

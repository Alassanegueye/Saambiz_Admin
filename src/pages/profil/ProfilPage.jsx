import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useProfil from './useProfil';
import FormulaireIdentite from './components/FormulaireIdentite';
import FormulaireMotDePasse from './components/FormulaireMotDePasse';

/**
 * Page « Mon profil » — accessible depuis le menu du compte, à droite de la
 * barre de navigation.
 */
export default function ProfilPage() {
  useTitrePage('Mon profil — SaamBiz Admin');
  const p = useProfil();

  if (p.chargement) return <LoadingSpinner fullPage />;

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Mon profil</h1>
          <p>Vos informations personnelles et votre mot de passe</p>
        </div>
      </div>

      <div className="profil-entete card">
        <div className="profil-avatar" aria-hidden="true">{p.initiales}</div>
        <div>
          <strong>{`${p.profil.prenom} ${p.profil.nom}`.trim() || 'Compte'}</strong>
          <span>{p.profil.email}</span>
        </div>
        <span className="profil-role">{p.role}</span>
      </div>

      <div className="profil-grille">
        <FormulaireIdentite
          profil={p.profil}
          majChamp={p.majChamp}
          enregistrement={p.enregistrement}
          onSubmit={p.enregistrerProfil}
        />
        <FormulaireMotDePasse
          mdp={p.mdp}
          majChampMdp={p.majChampMdp}
          erreur={p.erreurMdp}
          enCours={p.changementMdp}
          longueurMinimale={p.longueurMinimaleMdp}
          onSubmit={p.enregistrerMdp}
        />
      </div>
    </div>
  );
}

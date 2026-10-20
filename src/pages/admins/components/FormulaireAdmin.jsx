import Modal from '../../../components/common/Modal';
import FormField from '../../../components/forms/FormField';
import GrillePermissions from './GrillePermissions';

/** Création d'un administrateur, avec ses accès initiaux (style Yobante Boutique). */
export default function FormulaireAdmin({
  ouvert, valeurs, erreurs, enregistrement, onChange, onFermer, onCreer,
  menus, permissions, onChangerPermission,
}) {
  return (
    <Modal
      isOpen={ouvert}
      onClose={onFermer}
      large
      title="Nouvel administrateur"
      description="Le compte est actif immédiatement. Un mot de passe temporaire est envoyé par email ; il devra être changé à la première connexion."
      footer={(
        <>
          <button className="btn btn-secondary" onClick={onFermer} disabled={enregistrement}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={onCreer} disabled={enregistrement}>
            {enregistrement ? 'Création…' : 'Créer et envoyer les accès'}
          </button>
        </>
      )}
    >
      <div className="form-grille-2">
        <FormField
          label="Prénom" name="prenom" value={valeurs.prenom} onChange={onChange('prenom')}
          error={erreurs.prenom} required
        />
        <FormField
          label="Nom" name="nom" value={valeurs.nom} onChange={onChange('nom')}
          error={erreurs.nom} required
        />
      </div>
      <FormField
        label="Email" name="email" type="email" value={valeurs.email} onChange={onChange('email')}
        error={erreurs.email} required
      />

      {menus.length > 0 && (
        <div className="acces-section">
          <p className="acces-section-titre">Pages accessibles</p>
          <p className="acces-section-aide">L&apos;administrateur ne verra que ces pages dans le dashboard.</p>
          <GrillePermissions menus={menus} permissions={permissions} onChange={onChangerPermission} />
        </div>
      )}
    </Modal>
  );
}

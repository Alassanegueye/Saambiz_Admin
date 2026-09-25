import Modal from '../../../components/common/Modal';
import FormField from '../../../components/forms/FormField';
import GrillePermissions from './GrillePermissions';

/** Création d'un administrateur, avec ses droits initiaux. */
export default function FormulaireAdmin({
  ouvert, valeurs, erreurs, enregistrement, onChange, onFermer, onCreer,
  menus, permissions, onChangerPermission,
}) {
  return (
    <Modal
      isOpen={ouvert}
      onClose={onFermer}
      title="Nouvel administrateur"
      footer={(
        <>
          <button className="btn btn-secondary" onClick={onFermer} disabled={enregistrement}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={onCreer} disabled={enregistrement}>
            {enregistrement ? 'Création…' : 'Créer et envoyer email'}
          </button>
        </>
      )}
    >
      <FormField
        label="Nom" name="nom" value={valeurs.nom} onChange={onChange('nom')}
        error={erreurs.nom} required
      />
      <FormField
        label="Prénom" name="prenom" value={valeurs.prenom} onChange={onChange('prenom')}
        error={erreurs.prenom} required
      />
      <FormField
        label="Email" name="email" type="email" value={valeurs.email} onChange={onChange('email')}
        error={erreurs.email} required
      />

      {menus.length > 0 && (
        <div className="bloc-permissions">
          <div className="form-label libelle-permissions">Permissions par menu</div>
          <GrillePermissions
            menus={menus}
            permissions={permissions}
            onChange={onChangerPermission}
          />
        </div>
      )}
    </Modal>
  );
}

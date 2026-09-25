import Modal from '../../../components/common/Modal';
import FormField from '../../../components/forms/FormField';

/** Création ou modification d'une entrée de navigation. */
export default function FormulaireMenu({
  ouvert, edition, valeurs, erreurs, enregistrement, onChange, onFermer, onEnregistrer,
}) {
  return (
    <Modal
      isOpen={ouvert}
      onClose={onFermer}
      title={edition ? 'Modifier le menu' : 'Nouveau menu'}
      footer={(
        <>
          <button className="btn btn-secondary" onClick={onFermer} disabled={enregistrement}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={onEnregistrer} disabled={enregistrement}>
            {enregistrement ? 'Sauvegarde…' : (edition ? 'Enregistrer' : 'Créer')}
          </button>
        </>
      )}
    >
      <FormField
        label="Nom" name="name" value={valeurs.name} onChange={onChange}
        error={erreurs.name} required placeholder="Ex : Vendeurs"
      />
      {/* Le code est la clé technique référencée par les permissions RBAC. */}
      <FormField
        label="Code" name="code" value={valeurs.code} onChange={onChange}
        error={erreurs.code} required placeholder="Ex : VENDEURS"
      />
      <FormField
        label="Chemin (route)" name="path" value={valeurs.path} onChange={onChange}
        error={erreurs.path} required placeholder="Ex : /vendeurs"
      />
      <FormField
        label="Icône (optionnel)" name="icon" value={valeurs.icon} onChange={onChange}
        placeholder="Ex : store"
      />
      <FormField
        label="Ordre d'affichage" name="ordre" type="number" value={valeurs.ordre}
        onChange={onChange} placeholder="0"
      />
    </Modal>
  );
}

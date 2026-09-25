import Modal from '../../../components/common/Modal';
import FormField from '../../../components/forms/FormField';
import SearchInput from '../../../components/common/SearchInput';
import { TYPES } from '../useAbonnements';

/** Création d'un abonnement accordé manuellement par un administrateur. */
export default function FormulaireAbonnement({
  ouvert, valeurs, erreurs, enregistrement, onChange, onFermer, onCreer,
  vendeurs, rechercheVendeur, onRechercherVendeur,
}) {
  return (
    <Modal
      isOpen={ouvert}
      onClose={onFermer}
      title="Créer un abonnement manuel"
      footer={(
        <>
          <button className="btn btn-secondary" onClick={onFermer} disabled={enregistrement}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={onCreer} disabled={enregistrement}>
            {enregistrement ? 'Création…' : 'Créer'}
          </button>
        </>
      )}
    >
      <div className="form-field">
        <label className="form-label" htmlFor="vendeurId">
          Vendeur <span className="champ-requis">*</span>
        </label>
        {/* La liste des vendeurs peut être longue : on la réduit avant de choisir. */}
        <SearchInput
          value={rechercheVendeur}
          onChange={onRechercherVendeur}
          placeholder="Rechercher un vendeur…"
        />
        <select
          id="vendeurId"
          className="form-select champ-espace"
          value={valeurs.vendeurId}
          onChange={onChange('vendeurId')}
        >
          <option value="">— Sélectionner un vendeur —</option>
          {vendeurs.map((v) => (
            <option key={v.id} value={v.id}>{v.prenom} {v.nom} ({v.email})</option>
          ))}
        </select>
        {erreurs.vendeurId && <p className="form-error">{erreurs.vendeurId}</p>}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="type">Type d&apos;abonnement</label>
        <select
          id="type"
          className="form-select"
          value={valeurs.type}
          onChange={onChange('type')}
        >
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <FormField
        label="Date de début" name="dateDebut" type="date"
        value={valeurs.dateDebut} onChange={onChange('dateDebut')}
        error={erreurs.dateDebut} required
      />
      <FormField
        label="Date de fin" name="dateFin" type="date"
        value={valeurs.dateFin} onChange={onChange('dateFin')}
        error={erreurs.dateFin} required
      />
    </Modal>
  );
}

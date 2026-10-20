import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import FormField from '../../../components/forms/FormField';
import {
  STATUTS, STATUTS_PAIEMENT, MODES_LIVRAISON, referenceCommande,
} from '../useCommandes';

/**
 * Modification d'une commande : statut, paiement et coordonnées. Les
 * articles ne changent plus une fois la commande passée (prix et stock
 * figés) ; pour un autre panier, on annule et on en crée une nouvelle.
 */
export default function EditionCommande({ ouvert, commande, onFermer, onEnregistrer }) {
  const [v, setV] = useState(() => ({
    statut: commande?.statut || 'en_attente',
    statutPaiement: commande?.statutPaiement || 'non_paye',
    modeLivraison: commande?.modeLivraison || 'livraison',
    adresseLivraison: commande?.adresseLivraison || '',
    numeroTelephone: commande?.numeroTelephone || '',
    note: commande?.note || '',
  }));
  const [envoi, setEnvoi] = useState(false);
  const annulee = commande?.statut === 'annulee';
  const changer = (champ) => (e) => setV((x) => ({ ...x, [champ]: e.target.value }));

  const enregistrer = async () => {
    setEnvoi(true);
    try {
      await onEnregistrer(v);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal
      isOpen={ouvert}
      onClose={onFermer}
      title={`Modifier la commande ${referenceCommande(commande)}`}
      footer={(
        <>
          <button className="btn btn-secondary" onClick={onFermer} disabled={envoi}>Annuler</button>
          <button className="btn btn-primary" onClick={enregistrer} disabled={envoi}>
            {envoi ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </>
      )}
    >
      <div className="form-grille-2">
        <div className="form-field">
          <label className="form-label" htmlFor="ed-statut">Statut</label>
          <select id="ed-statut" className="form-select" value={v.statut} onChange={changer('statut')} disabled={annulee}>
            {STATUTS.filter((s) => s.value).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="ed-paiement">Paiement</label>
          <select id="ed-paiement" className="form-select" value={v.statutPaiement} onChange={changer('statutPaiement')}>
            {STATUTS_PAIEMENT.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="ed-mode">Mode de remise</label>
          <select id="ed-mode" className="form-select" value={v.modeLivraison} onChange={changer('modeLivraison')}>
            {MODES_LIVRAISON.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <FormField label="Téléphone de contact" name="ed-tel" value={v.numeroTelephone} onChange={changer('numeroTelephone')} />
      </div>
      <FormField label="Adresse de livraison" name="ed-adresse" value={v.adresseLivraison} onChange={changer('adresseLivraison')} />
      <FormField label="Note" name="ed-note" as="textarea" value={v.note} onChange={changer('note')} />
      <p className="form-hint">
        {annulee
          ? 'Commande annulée : son statut ne change plus.'
          : 'Passer à « Annulée » rend le stock à la boutique et marque un paiement reçu comme remboursé.'}
      </p>
    </Modal>
  );
}

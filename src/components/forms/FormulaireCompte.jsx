import { useState } from 'react';
import Modal from '../common/Modal';
import FormField from './FormField';

const VIDE = { prenom: '', nom: '', email: '', telephone: '', adresse: '' };

/**
 * Création ou modification d'un compte client / vendeur.
 * En création, un mot de passe provisoire est généré par le serveur et
 * envoyé par email à la personne.
 *
 * Le parent monte ce composant avec une `key` différente à chaque ouverture :
 * le formulaire repart ainsi des bonnes valeurs sans effet de synchronisation.
 */
export default function FormulaireCompte({ ouvert, compte, type = 'client', onFermer, onEnregistrer }) {
  const edition = Boolean(compte?.id);
  const [valeurs, setValeurs] = useState(() => ({
    ...VIDE,
    ...(compte ? Object.fromEntries(Object.keys(VIDE).map((k) => [k, compte[k] || ''])) : {}),
  }));
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  const changer = (champ) => (e) => {
    setValeurs((v) => ({ ...v, [champ]: e.target.value }));
    if (erreurs[champ]) setErreurs((p) => ({ ...p, [champ]: undefined }));
  };

  const valider = () => {
    const e = {};
    if (!valeurs.prenom.trim()) e.prenom = 'Requis';
    if (!valeurs.nom.trim()) e.nom = 'Requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeurs.email.trim())) e.email = 'Email invalide';
    const tel = valeurs.telephone.replace(/[\s.-]/g, '');
    if (tel && !/^\+?\d{7,15}$/.test(tel)) e.telephone = 'Téléphone invalide';
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const enregistrer = async () => {
    if (!valider()) return;
    setEnvoi(true);
    try {
      await onEnregistrer(valeurs);
    } finally {
      setEnvoi(false);
    }
  };

  const admin = type === 'admin';
  const libelle = { vendeur: 'le vendeur', admin: "l'administrateur", client: 'le client' }[type] || 'le client';
  const nouveau = { vendeur: 'Nouveau vendeur', admin: 'Nouvel administrateur', client: 'Nouveau client' }[type] || 'Nouveau client';

  return (
    <Modal
      isOpen={ouvert}
      onClose={onFermer}
      title={edition ? `Modifier ${libelle}` : nouveau}
      footer={(
        <>
          <button className="btn btn-secondary" onClick={onFermer} disabled={envoi}>Annuler</button>
          <button className="btn btn-primary" onClick={enregistrer} disabled={envoi}>
            {envoi ? 'Enregistrement…' : edition ? 'Enregistrer' : 'Créer et envoyer les accès'}
          </button>
        </>
      )}
    >
      <div className="form-grille-2">
        <FormField label="Prénom" name="prenom" value={valeurs.prenom} onChange={changer('prenom')} error={erreurs.prenom} required />
        <FormField label="Nom" name="nom" value={valeurs.nom} onChange={changer('nom')} error={erreurs.nom} required />
      </div>
      <FormField label="Email" name="email" type="email" value={valeurs.email} onChange={changer('email')} error={erreurs.email} required />
      {!admin && (
      <FormField
        label={type === 'vendeur' ? 'Téléphone / WhatsApp' : 'Téléphone'}
        name="telephone" value={valeurs.telephone} onChange={changer('telephone')}
        error={erreurs.telephone} placeholder="77 123 45 67"
      />
      )}
      {!admin && (
      <FormField label="Adresse" name="adresse" value={valeurs.adresse} onChange={changer('adresse')} placeholder="Quartier, ville" />
      )}
      {!edition && (
        <p className="form-hint">
          Un mot de passe provisoire est généré et envoyé par email. La personne le change à sa première connexion.
        </p>
      )}
    </Modal>
  );
}

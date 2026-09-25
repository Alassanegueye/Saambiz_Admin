import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getVendeursAValider,
  validerProfilVendeur,
  rejeterProfilVendeur,
} from '../../service/admin.service';

/**
 * Contrôleur de la file d'attente des profils vendeurs à examiner.
 *
 * À ne pas confondre avec la vérification d'email : ici l'administrateur
 * regarde une pièce justificative et engage la responsabilité de la
 * plateforme. Un profil approuvé porte le badge « Boutique vérifiée » et
 * remonte dans les sélections de l'accueil des clients.
 */
export default function useValidationVendeurs() {
  const [vendeurs, setVendeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apercu, setApercu] = useState(null);      // pièce affichée en grand
  const [aValider, setAValider] = useState(null);
  const [aRejeter, setARejeter] = useState(null);
  const [motif, setMotif] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVendeursAValider();
      const liste = res.data?.vendeurs || res.data?.data || [];
      setVendeurs(Array.isArray(liste) ? liste : []);
    } catch {
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const ouvrirRejet = (vendeur) => {
    setARejeter(vendeur);
    setMotif('');
  };

  const valider = async () => {
    if (!aValider) return;
    try {
      await validerProfilVendeur(aValider.id);
      toast.success(`Profil de ${aValider.prenom} ${aValider.nom} approuvé`);
      setAValider(null);
      await charger();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  const rejeter = async () => {
    if (!aRejeter) return;
    // Le motif part au vendeur : le laisser vide reviendrait à refuser sans dire pourquoi.
    if (!motif.trim()) {
      toast.error('Indiquez le motif du rejet — le vendeur le lira.');
      return;
    }
    setEnregistrement(true);
    try {
      await rejeterProfilVendeur(aRejeter.id, motif.trim());
      toast.success('Profil rejeté');
      setARejeter(null);
      setMotif('');
      await charger();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors du rejet');
    } finally {
      setEnregistrement(false);
    }
  };

  return {
    vendeurs, loading,
    apercu, setApercu,
    aValider, setAValider, valider,
    aRejeter, setARejeter, ouvrirRejet, rejeter,
    motif, setMotif, enregistrement,
  };
}

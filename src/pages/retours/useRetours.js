import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getDemandesRetour, traiterDemandeRetour } from '../../service/retours.service';
import useListeFiltree from '../../hooks/useListeFiltree';

/**
 * Contrôleur de la page Demandes de retour.
 *
 * Le statut filtre côté serveur, la recherche (raison ou numéro de commande)
 * côté client sur ce qui est déjà chargé.
 */

export const STATUTS = [
  { value: '',           label: 'Tous les statuts' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'acceptee',   label: 'Acceptée' },
  { value: 'refusee',    label: 'Refusée' },
];

/** Le backend renvoie les statuts avec ou sans accents selon la version. */
export function varianteStatut(statut) {
  const s = (statut || '').toLowerCase();
  if (s === 'acceptee' || s === 'acceptée') return 'success';
  if (s === 'refusee' || s === 'refusée') return 'danger';
  return 'warning';
}

/** Seules les demandes encore en attente peuvent être traitées. */
export const estTraitable = (r) => !r.statut || r.statut.toLowerCase() === 'en_attente';

export default function useRetours() {
  const [statutFiltre, setStatutFiltre] = useState('');
  const [traitement, setTraitement] = useState({ ouvert: false, action: null, retour: null });
  const [reponseAdmin, setReponseAdmin] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(
    () => getDemandesRetour(statutFiltre ? { statut: statutFiltre } : undefined),
    [statutFiltre]
  );

  const liste = useListeFiltree(charger, {
    extraire: (res) => res.data?.demandes || res.data?.data || res.data || [],
    filtrer: (r, s) =>
      (r.raison || '').toLowerCase().includes(s)
      || String(r.commandeId || '').includes(s),
    messageErreur: 'Erreur lors du chargement des demandes de retour',
  });

  const filtrerParStatut = (valeur) => {
    setStatutFiltre(valeur);
    liste.setPage(1);
  };

  const ouvrirTraitement = (action, retour) => {
    setTraitement({ ouvert: true, action, retour });
    setReponseAdmin('');
  };

  const fermerTraitement = () => setTraitement({ ouvert: false, action: null, retour: null });

  const confirmerTraitement = async () => {
    const { action, retour } = traitement;
    if (!retour) return;
    setEnregistrement(true);
    try {
      await traiterDemandeRetour(retour.id, { action, reponseAdmin });
      toast.success(
        action === 'accepter' ? 'Demande de retour acceptée' : 'Demande de retour refusée'
      );
      fermerTraitement();
      await liste.recharger();
    } catch {
      toast.error('Erreur lors du traitement de la demande');
    } finally {
      setEnregistrement(false);
    }
  };

  return {
    ...liste,
    statutFiltre,
    filtrerParStatut,
    traitement,
    ouvrirTraitement,
    fermerTraitement,
    confirmerTraitement,
    reponseAdmin,
    setReponseAdmin,
    enregistrement,
  };
}

import { useState, useCallback } from 'react';
import { toast } from '../../utils/alert';
import {
  getClients,
  supprimerUtilisateur,
  activerUtilisateur,
} from '../../service/admin.service';
import useListeFiltree from '../../hooks/useListeFiltree';

/**
 * Contrôleur de la page Acheteurs.
 *
 * Le chargement, la recherche et la pagination viennent du hook partagé ; il
 * ne reste ici que ce qui est propre aux acheteurs : les deux actions et la
 * confirmation qui les précède.
 */
export default function useAcheteurs() {
  const liste = useListeFiltree(getClients, {
    extraire: (res) => res.data?.clients || res.data || [],
    filtrer: (c, s) =>
      (c.nom || '').toLowerCase().includes(s)
      || (c.prenom || '').toLowerCase().includes(s)
      || (c.email || '').toLowerCase().includes(s),
    messageErreur: 'Erreur lors du chargement des acheteurs',
  });

  const [selection, setSelection] = useState(null);
  const [detailOuvert, setDetailOuvert] = useState(false);

  // Une seule modale de confirmation pour deux actions opposées : le champ
  // `action` évite d'en maintenir deux qui finiraient par s'ouvrir ensemble.
  const [confirmation, setConfirmation] = useState({ ouvert: false, action: null, client: null });

  const ouvrirDetail = (client) => { setSelection(client); setDetailOuvert(true); };
  const demanderConfirmation = (action, client) => setConfirmation({ ouvert: true, action, client });
  const fermerConfirmation = () => setConfirmation({ ouvert: false, action: null, client: null });

  const nomComplet = (c) => `${c?.prenom || ''} ${c?.nom || ''}`.trim();

  const executer = useCallback(async () => {
    const { action, client } = confirmation;
    if (!client) return;
    try {
      if (action === 'activer') {
        await activerUtilisateur(client.id);
        toast.success(`Client ${nomComplet(client)} activé`);
      } else if (action === 'supprimer') {
        await supprimerUtilisateur(client.id);
        toast.success(`Client ${nomComplet(client)} supprimé`);
      }
      fermerConfirmation();
      await liste.recharger();
    } catch {
      toast.error(action === 'supprimer'
        ? 'Erreur lors de la suppression'
        : "Erreur lors de l'activation");
    }
  }, [confirmation, liste]);

  return {
    ...liste,
    selection, detailOuvert, setDetailOuvert, ouvrirDetail,
    confirmation, demanderConfirmation, fermerConfirmation, executer,
    nomComplet,
  };
}

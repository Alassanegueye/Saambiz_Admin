import {
  getClients, creerAcheteur, modifierAcheteur, suspendreAcheteur, activerAcheteur, supprimerAcheteur,
} from '../../service/admin.service';
import useComptes, { nomComplet, estActif } from '../../hooks/useComptes';

export { nomComplet, estActif };

const API = {
  creer: creerAcheteur,
  modifier: modifierAcheteur,
  suspendre: suspendreAcheteur,
  activer: activerAcheteur,
  supprimer: supprimerAcheteur,
};

/** Contrôleur de la page Clients (acheteurs). */
export default function useAcheteurs() {
  return useComptes({
    charger: getClients,
    extraire: (res) => res.data?.clients || res.data || [],
    libelle: { singulier: 'client', Singulier: 'Client', pluriel: 'clients' },
    api: API,
  });
}

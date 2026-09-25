import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  getNombreVendeursActifs, getNombreVendeursInactifs,
  getNombreProduitsActifs, getNombreClientsActifs,
  getNombreClientsInactifs, getVendeurs, getClients,
  getRevenusMensuels, getInscriptionsMensuelles,
} from '../../service/admin.service';
import { getStatsEcommerce } from '../../service/commandes.service';

/**
 * Contrôleur du tableau de bord.
 *
 * Deux chargements séparés volontairement : les compteurs de base doivent
 * s'afficher tout de suite, alors que les statistiques e-commerce et les
 * graphiques sont plus lents et ne doivent pas retarder la page.
 */

const NB_LIGNES_RECENTES = 5;

/** Les compteurs ont changé de nom de champ entre deux versions du backend. */
const lireCompteur = (res, ...cles) => {
  for (const cle of cles) {
    const valeur = res?.data?.[cle];
    if (valeur !== undefined && valeur !== null) return valeur;
  }
  return 0;
};

const lireListe = (res, ...cles) => {
  for (const cle of cles) {
    const valeur = res?.data?.[cle];
    if (Array.isArray(valeur)) return valeur;
  }
  return Array.isArray(res?.data) ? res.data : [];
};

export default function useTableauDeBord() {
  const [stats, setStats] = useState(null);
  const [vendeurs, setVendeurs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statsEcommerce, setStatsEcommerce] = useState(null);
  const [revenusMensuels, setRevenusMensuels] = useState([]);
  const [inscriptionsMensuelles, setInscriptionsMensuelles] = useState([]);
  const [loadingAvance, setLoadingAvance] = useState(true);

  useEffect(() => {
    const chargerBase = async () => {
      try {
        const [va, vi, pa, ca, ci, listeVendeurs, listeClients] = await Promise.all([
          getNombreVendeursActifs(), getNombreVendeursInactifs(),
          getNombreProduitsActifs(), getNombreClientsActifs(),
          getNombreClientsInactifs(), getVendeurs(), getClients(),
        ]);
        setStats({
          vendeursActifs: lireCompteur(va, 'count', 'totalVendeurs'),
          vendeursInactifs: lireCompteur(vi, 'count', 'totalVendeurs'),
          produitsActifs: lireCompteur(pa, 'count', 'totalProduits'),
          clientsActifs: lireCompteur(ca, 'count', 'totalClients'),
          clientsInactifs: lireCompteur(ci, 'count', 'totalClients'),
        });
        setVendeurs(lireListe(listeVendeurs, 'vendeurs').slice(0, NB_LIGNES_RECENTES));
        setClients(lireListe(listeClients, 'clients').slice(0, NB_LIGNES_RECENTES));
      } catch {
        toast.error('Erreur lors du chargement du tableau de bord');
      } finally {
        setLoading(false);
      }
    };
    chargerBase();
  }, []);

  useEffect(() => {
    const chargerAvance = async () => {
      try {
        const [ecommerce, revenus, inscriptions] = await Promise.all([
          getStatsEcommerce(), getRevenusMensuels(), getInscriptionsMensuelles(),
        ]);
        setStatsEcommerce(ecommerce.data?.stats || ecommerce.data || null);
        setRevenusMensuels(lireListe(revenus, 'revenus', 'data'));
        setInscriptionsMensuelles(lireListe(inscriptions, 'inscriptions', 'data'));
      } catch {
        toast.error('Erreur lors du chargement des statistiques avancées');
      } finally {
        setLoadingAvance(false);
      }
    };
    chargerAvance();
  }, []);

  return {
    stats, vendeurs, clients, loading,
    statsEcommerce, revenusMensuels, inscriptionsMensuelles, loadingAvance,
  };
}

import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  getAbonnements,
  creerAbonnementManuel,
  revoquerAbonnement,
  getAbonnementsExpiration,
} from '../../service/abonnements.service';
import { getVendeurs } from '../../service/admin.service';
import useListeFiltree from '../../hooks/useListeFiltree';

/**
 * Contrôleur de la page Abonnements.
 *
 * Trois sources distinctes : la liste filtrable, les abonnements qui expirent
 * bientôt (bandeau d'alerte) et la liste des vendeurs, chargée seulement à
 * l'ouverture du formulaire de création manuelle.
 */

export const JOURS_ALERTE_EXPIRATION = 30;

export const STATUTS = [
  { value: '',        label: 'Tous les statuts' },
  { value: 'actif',   label: 'Actif' },
  { value: 'expire',  label: 'Expiré' },
  { value: 'revoque', label: 'Révoqué' },
];

export const TYPES = [
  { value: 'mensuel', label: 'Mensuel' },
  { value: 'annuel',  label: 'Annuel' },
];

/** Le backend renvoie les statuts avec ou sans accents selon la version. */
export function varianteStatut(statut) {
  const s = (statut || '').toLowerCase();
  if (s === 'actif' || s === 'active') return 'success';
  if (s === 'expire' || s === 'expiré' || s === 'revoque' || s === 'révoqué') return 'danger';
  return 'default';
}

/** Le vendeur arrive tantôt en chaîne, tantôt en objet. */
export const nomVendeur = (abonnement) => {
  const v = abonnement?.vendeur;
  if (typeof v === 'string') return v || '—';
  return `${v?.prenom || ''} ${v?.nom || ''}`.trim() || '—';
};

const FORMULAIRE_VIDE = { vendeurId: '', type: 'mensuel', dateDebut: '', dateFin: '' };

export default function useAbonnements() {
  const [statutFiltre, setStatutFiltre] = useState('');

  const charger = useCallback(
    () => getAbonnements(statutFiltre ? { statut: statutFiltre } : undefined),
    [statutFiltre]
  );

  const liste = useListeFiltree(charger, {
    extraire: (res) => res.data?.abonnements || res.data?.data || res.data || [],
    filtrer: (a, s) => nomVendeur(a).toLowerCase().includes(s),
    messageErreur: 'Erreur lors du chargement des abonnements',
  });

  const filtrerParStatut = (valeur) => {
    setStatutFiltre(valeur);
    liste.setPage(1);
  };

  // ── Bandeau des abonnements arrivant à expiration ──
  const [expirants, setExpirants] = useState([]);
  const [loadingExpirants, setLoadingExpirants] = useState(true);

  useEffect(() => {
    const chargerExpirants = async () => {
      try {
        const res = await getAbonnementsExpiration(JOURS_ALERTE_EXPIRATION);
        const liste = res.data?.abonnements || res.data?.data || res.data || [];
        setExpirants(Array.isArray(liste) ? liste : []);
      } catch {
        toast.error('Erreur lors du chargement des abonnements arrivant à expiration');
      } finally {
        setLoadingExpirants(false);
      }
    };
    chargerExpirants();
  }, []);

  // ── Création manuelle ──
  const [creationOuverte, setCreationOuverte] = useState(false);
  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [erreurs, setErreurs] = useState({});
  const [enregistrement, setEnregistrement] = useState(false);
  const [vendeurs, setVendeurs] = useState([]);
  const [rechercheVendeur, setRechercheVendeur] = useState('');

  const ouvrirCreation = async () => {
    setFormulaire(FORMULAIRE_VIDE);
    setErreurs({});
    setRechercheVendeur('');
    setCreationOuverte(true);
    // Les vendeurs ne servent qu'ici : inutile de les charger au montage.
    try {
      const res = await getVendeurs();
      const liste = res.data?.vendeurs || res.data || [];
      setVendeurs(Array.isArray(liste) ? liste : []);
    } catch {
      toast.error('Erreur lors du chargement des vendeurs');
    }
  };

  const fermerCreation = () => setCreationOuverte(false);

  const vendeursFiltres = useMemo(() => {
    const s = rechercheVendeur.toLowerCase();
    if (!s) return vendeurs;
    return vendeurs.filter((v) =>
      `${v.prenom || ''} ${v.nom || ''} ${v.email || ''}`.toLowerCase().includes(s));
  }, [vendeurs, rechercheVendeur]);

  const changerChamp = (champ) => (e) => {
    const valeur = e?.target ? e.target.value : e;
    setFormulaire((f) => ({ ...f, [champ]: valeur }));
    if (erreurs[champ]) setErreurs((prec) => ({ ...prec, [champ]: undefined }));
  };

  const valider = () => {
    const e = {};
    if (!formulaire.vendeurId) e.vendeurId = 'Sélectionnez un vendeur';
    if (!formulaire.dateDebut) e.dateDebut = 'Date de début requise';
    if (!formulaire.dateFin) e.dateFin = 'Date de fin requise';
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const creer = async () => {
    if (!valider()) return;
    setEnregistrement(true);
    try {
      await creerAbonnementManuel(formulaire.vendeurId, {
        type: formulaire.type,
        dateDebut: formulaire.dateDebut,
        dateFin: formulaire.dateFin,
      });
      toast.success('Abonnement manuel créé avec succès');
      setCreationOuverte(false);
      await liste.recharger();
    } catch {
      toast.error("Erreur lors de la création de l'abonnement");
    } finally {
      setEnregistrement(false);
    }
  };

  // ── Révocation ──
  const [cibleRevocation, setCibleRevocation] = useState(null);

  const revoquer = async () => {
    if (!cibleRevocation) return;
    try {
      await revoquerAbonnement(cibleRevocation.id);
      toast.success('Abonnement révoqué');
      setCibleRevocation(null);
      await liste.recharger();
    } catch {
      toast.error("Erreur lors de la révocation de l'abonnement");
    }
  };

  return {
    ...liste,
    statutFiltre, filtrerParStatut,
    expirants, loadingExpirants,
    creationOuverte, ouvrirCreation, fermerCreation,
    formulaire, erreurs, enregistrement, changerChamp, creer,
    vendeursFiltres, rechercheVendeur, setRechercheVendeur,
    cibleRevocation, setCibleRevocation, revoquer,
  };
}

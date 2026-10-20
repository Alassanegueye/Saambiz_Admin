import { useEffect, useState, useCallback } from 'react';
import { toast } from '../../utils/alert';
import { getPrixAbonnement, updatePrixAbonnement } from '../../service/admin.service';
import { getConfigs, createConfig, updateConfig } from '../../service/configs.service';

/**
 * Contrôleur de la page Configuration.
 *
 * Deux réglages indépendants cohabitent : le prix de l'abonnement, qui a sa
 * propre route côté backend, et le magasin clé/valeur des configurations
 * générales. Ils sont chargés séparément pour qu'une panne de l'un n'empêche
 * pas d'éditer l'autre.
 */

const CONFIG_VIDE = { cle: '', valeur: '', description: '' };

export default function useConfig() {
  // ── Prix de l'abonnement ──
  const [prixActuel, setPrixActuel] = useState(null);
  const [nouveauPrix, setNouveauPrix] = useState('');
  const [loading, setLoading] = useState(true);
  const [enregistrementPrix, setEnregistrementPrix] = useState(false);
  const [confirmationOuverte, setConfirmationOuverte] = useState(false);

  // ── Configurations générales ──
  const [configs, setConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [cibleEdition, setCibleEdition] = useState(null);
  const [formulaire, setFormulaire] = useState(CONFIG_VIDE);
  const [erreurs, setErreurs] = useState({});
  const [enregistrementConfig, setEnregistrementConfig] = useState(false);

  useEffect(() => {
    const chargerPrix = async () => {
      try {
        const res = await getPrixAbonnement();
        const prix = res.data?.prix ?? res.data?.price ?? null;
        setPrixActuel(prix);
        if (prix !== null) setNouveauPrix(String(prix));
      } catch {
        toast.error('Erreur lors du chargement du prix');
      } finally {
        setLoading(false);
      }
    };
    chargerPrix();
  }, []);

  const chargerConfigs = useCallback(async () => {
    try {
      const res = await getConfigs();
      const liste = res.data?.configs || res.data?.data || res.data || [];
      setConfigs(Array.isArray(liste) ? liste : []);
    } catch {
      toast.error('Erreur lors du chargement des configurations');
    } finally {
      setLoadingConfigs(false);
    }
  }, []);

  useEffect(() => { chargerConfigs(); }, [chargerConfigs]);

  const enregistrerPrix = async () => {
    const prix = parseFloat(nouveauPrix);
    if (Number.isNaN(prix) || prix <= 0) {
      toast.error('Veuillez saisir un prix valide');
      return;
    }
    setEnregistrementPrix(true);
    try {
      await updatePrixAbonnement(prix);
      setPrixActuel(prix);
      toast.success('Prix mis à jour avec succès');
    } catch {
      toast.error('Erreur lors de la mise à jour du prix');
    } finally {
      setEnregistrementPrix(false);
    }
  };

  /** Revient à la valeur enregistrée sans recharger la page. */
  const annulerPrix = () =>
    setNouveauPrix(prixActuel !== null ? String(prixActuel) : '');

  const ouvrirCreationConfig = () => {
    setCibleEdition(null);
    setFormulaire(CONFIG_VIDE);
    setErreurs({});
    setFormulaireOuvert(true);
  };

  const ouvrirEditionConfig = (cfg) => {
    setCibleEdition(cfg);
    setFormulaire({ cle: cfg.cle, valeur: cfg.valeur ?? '', description: cfg.description ?? '' });
    setErreurs({});
    setFormulaireOuvert(true);
  };

  const fermerFormulaire = () => setFormulaireOuvert(false);

  const changerChamp = (e) => {
    const { name, value } = e.target;
    setFormulaire((f) => ({ ...f, [name]: value }));
    if (erreurs[name]) setErreurs((prec) => ({ ...prec, [name]: undefined }));
  };

  const validerConfig = () => {
    const e = {};
    if (!formulaire.cle.trim()) e.cle = 'La clé est requise';
    if (!formulaire.valeur.trim()) e.valeur = 'La valeur est requise';
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const enregistrerConfig = async () => {
    if (!validerConfig()) return;
    setEnregistrementConfig(true);
    try {
      if (cibleEdition) {
        // La clé identifie la configuration : elle n'est pas modifiable.
        await updateConfig(cibleEdition.cle, {
          valeur: formulaire.valeur,
          description: formulaire.description,
        });
        toast.success('Configuration mise à jour');
      } else {
        await createConfig(formulaire);
        toast.success('Configuration créée');
      }
      setFormulaireOuvert(false);
      await chargerConfigs();
    } catch {
      toast.error('Erreur lors de la sauvegarde de la configuration');
    } finally {
      setEnregistrementConfig(false);
    }
  };

  return {
    loading,
    prixActuel, nouveauPrix, setNouveauPrix, enregistrementPrix,
    confirmationOuverte, setConfirmationOuverte, enregistrerPrix, annulerPrix,
    configs, loadingConfigs,
    formulaireOuvert, cibleEdition, formulaire, erreurs, enregistrementConfig,
    ouvrirCreationConfig, ouvrirEditionConfig, fermerFormulaire, changerChamp, enregistrerConfig,
  };
}

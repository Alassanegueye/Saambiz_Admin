import { useState } from 'react';
import { toast } from 'react-toastify';
import { changerMotDePasse } from '../../service/password.service';
import { useAuth } from '../../hooks/useAuth';

/**
 * Contrôleur de l'écran imposé à la première connexion.
 *
 * Une fois le mot de passe changé, la session est fermée : le jeton en cours
 * a été obtenu avec le mot de passe temporaire, qui ne doit plus ouvrir quoi
 * que ce soit.
 */

const LONGUEUR_MINIMALE = 8;

const FORMULAIRE_VIDE = {
  ancienMotDePasse: '',
  nouveauMotDePasse: '',
  confirmation: '',
};

/** Champs de l'écran, dans l'ordre d'affichage. */
export const CHAMPS = [
  {
    nom: 'ancienMotDePasse',
    label: 'Mot de passe temporaire',
    placeholder: '••••••••',
  },
  {
    nom: 'nouveauMotDePasse',
    label: 'Nouveau mot de passe',
    placeholder: 'Min. 8 chars, 1 majuscule, 1 chiffre, 1 spécial',
  },
  {
    nom: 'confirmation',
    label: 'Confirmer le nouveau mot de passe',
    placeholder: '••••••••',
  },
];

export default function useChangementMotDePasse() {
  const { logout } = useAuth();

  const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
  const [erreurs, setErreurs] = useState({});
  const [enregistrement, setEnregistrement] = useState(false);

  const changerChamp = (e) => {
    const { name, value } = e.target;
    setFormulaire((f) => ({ ...f, [name]: value }));
    if (erreurs[name]) setErreurs((prec) => ({ ...prec, [name]: undefined }));
  };

  const valider = () => {
    const e = {};
    if (!formulaire.ancienMotDePasse) e.ancienMotDePasse = 'Requis';
    if (!formulaire.nouveauMotDePasse) e.nouveauMotDePasse = 'Requis';
    else if (formulaire.nouveauMotDePasse.length < LONGUEUR_MINIMALE) {
      e.nouveauMotDePasse = `Minimum ${LONGUEUR_MINIMALE} caractères`;
    }
    if (formulaire.nouveauMotDePasse !== formulaire.confirmation) {
      e.confirmation = 'Les mots de passe ne correspondent pas';
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const soumettre = async (e) => {
    e.preventDefault();
    if (!valider()) return;
    setEnregistrement(true);
    try {
      await changerMotDePasse(formulaire);
      toast.success('Mot de passe modifié avec succès ! Reconnectez-vous.');
      await logout();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Erreur lors du changement de mot de passe.'
      );
    } finally {
      setEnregistrement(false);
    }
  };

  return { formulaire, erreurs, enregistrement, changerChamp, soumettre };
}

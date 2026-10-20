import { useEffect, useMemo, useState } from 'react';
import Modal from '../../../components/common/Modal';
import FormField from '../../../components/forms/FormField';
import { libelleBoutique } from '../../../hooks/useBoutiques';
import { getCategoriesActives } from '../../../service/catalogue.service';

const VIDE = {
  boutiqueId: '', nom: '', categorieId: '', prix: '', prix_promo: '',
  quantite: '', marque: '', description: '', disponible: true,
};

/**
 * Ajout ou modification d'un produit. La boutique est obligatoire : c'est
 * elle qui porte le produit. Monté avec une `key` neuve à chaque ouverture.
 */
export default function FormulaireProduit({ ouvert, produit, boutiques, boutiqueParDefaut, onFermer, onEnregistrer }) {
  const edition = Boolean(produit?.id);
  const [valeurs, setValeurs] = useState(() => (edition ? {
    boutiqueId: produit.boutique?.id || '',
    nom: produit.nom || '',
    categorieId: produit.categorie?.id || produit.categorieId || '',
    prix: produit.prix ?? '',
    prix_promo: produit.prix_promo ?? '',
    quantite: produit.quantite ?? '',
    marque: produit.marque || '',
    description: produit.description || '',
    disponible: produit.disponible !== false,
  } : { ...VIDE, boutiqueId: boutiqueParDefaut || '' }));
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    getCategoriesActives()
      .then((res) => setCategories(res.data?.categories || []))
      .catch(() => {});
  }, []);

  // Aperçu du fichier choisi, libéré quand il change.
  const apercuLocal = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  useEffect(() => () => { if (apercuLocal) URL.revokeObjectURL(apercuLocal); }, [apercuLocal]);
  const apercu = apercuLocal || produit?.image || '';

  const changer = (champ) => (e) => {
    const valeur = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValeurs((v) => ({ ...v, [champ]: valeur }));
    if (erreurs[champ]) setErreurs((p) => ({ ...p, [champ]: undefined }));
  };

  const valider = () => {
    const e = {};
    if (!valeurs.boutiqueId) e.boutiqueId = 'Choisissez la boutique';
    if (!valeurs.nom.trim()) e.nom = 'Requis';
    if (!valeurs.categorieId) e.categorieId = 'Choisissez une catégorie';
    if (valeurs.prix === '' || Number(valeurs.prix) < 0) e.prix = 'Prix invalide';
    if (valeurs.prix_promo !== '' && Number(valeurs.prix_promo) >= Number(valeurs.prix)) {
      e.prix_promo = 'Doit être inférieur au prix';
    }
    if (valeurs.quantite === '' || !Number.isInteger(Number(valeurs.quantite)) || Number(valeurs.quantite) < 0) {
      e.quantite = 'Quantité invalide';
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const enregistrer = async () => {
    if (!valider()) return;
    setEnvoi(true);
    try {
      await onEnregistrer({ ...valeurs, nom: valeurs.nom.trim() }, image);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal
      isOpen={ouvert}
      onClose={onFermer}
      large
      title={edition ? 'Modifier le produit' : 'Nouveau produit'}
      footer={(
        <>
          <button className="btn btn-secondary" onClick={onFermer} disabled={envoi}>Annuler</button>
          <button className="btn btn-primary" onClick={enregistrer} disabled={envoi}>
            {envoi ? 'Enregistrement…' : edition ? 'Enregistrer' : 'Ajouter le produit'}
          </button>
        </>
      )}
    >
      <div className="form-field">
        <label className="form-label" htmlFor="boutiqueId">Boutique<span className="champ-requis"> *</span></label>
        <select id="boutiqueId" className="form-select" value={valeurs.boutiqueId} onChange={changer('boutiqueId')}>
          <option value="">Choisir la boutique…</option>
          {boutiques.map((b) => <option key={b.id} value={b.id}>{libelleBoutique(b)}</option>)}
        </select>
        {erreurs.boutiqueId && <p className="form-error">{erreurs.boutiqueId}</p>}
      </div>

      <div className="form-grille-2">
        <FormField label="Nom du produit" name="nom" value={valeurs.nom} onChange={changer('nom')} error={erreurs.nom} required />
        <div className="form-field">
          <label className="form-label" htmlFor="categorieId">Catégorie<span className="champ-requis"> *</span></label>
          <select id="categorieId" className="form-select" value={valeurs.categorieId} onChange={changer('categorieId')}>
            <option value="">Choisir…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          {erreurs.categorieId && <p className="form-error">{erreurs.categorieId}</p>}
        </div>
        <FormField label="Prix (FCFA)" name="prix" type="number" value={valeurs.prix} onChange={changer('prix')} error={erreurs.prix} required />
        <FormField label="Prix soldé (FCFA)" name="prix_promo" type="number" value={valeurs.prix_promo} onChange={changer('prix_promo')} error={erreurs.prix_promo} placeholder="Optionnel" />
        <FormField label="Quantité en stock" name="quantite" type="number" value={valeurs.quantite} onChange={changer('quantite')} error={erreurs.quantite} required />
        <FormField label="Marque" name="marque" value={valeurs.marque} onChange={changer('marque')} placeholder="Optionnel" />
      </div>

      <FormField label="Description" name="description" as="textarea" value={valeurs.description} onChange={changer('description')} />

      <div className="form-grille-2">
        <div className="form-field">
          <label className="form-label" htmlFor="image">Image</label>
          <input
            id="image" type="file" accept="image/jpeg,image/png,image/webp" className="form-input"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          {apercu && <img className="apercu-image" src={apercu} alt="" />}
        </div>
        <label className="case-a-cocher">
          <input type="checkbox" checked={valeurs.disponible} onChange={changer('disponible')} />
          <span>Visible et en vente</span>
        </label>
      </div>
    </Modal>
  );
}

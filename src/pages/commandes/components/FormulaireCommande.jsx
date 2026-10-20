import { useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import FormField from '../../../components/forms/FormField';
import { libelleBoutique } from '../../../hooks/useBoutiques';
import { getProduits } from '../../../service/catalogue.service';
import { getClients } from '../../../service/admin.service';
import { formatMontant } from '../../../utils/formatters';
import { MODES_LIVRAISON, MODES_PAIEMENT } from '../useCommandes';

const prixVente = (p) => {
  const prix = Number(p?.prix || 0);
  const solde = Number(p?.prix_promo || 0);
  return solde > 0 && solde < prix ? solde : prix;
};

/**
 * Nouvelle commande saisie par l'admin (commande par téléphone, en
 * boutique…). On choisit d'abord la boutique : seuls ses produits en vente
 * sont proposés, une commande ne mélangeant jamais deux boutiques.
 */
export default function FormulaireCommande({ ouvert, boutiques, boutiqueParDefaut, onFermer, onCreer }) {
  const [boutiqueId, setBoutiqueId] = useState(boutiqueParDefaut || '');
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(Boolean(boutiqueParDefaut));
  const [lignes, setLignes] = useState([{ produitId: '', quantite: 1 }]);
  const [typeClient, setTypeClient] = useState('libre'); // 'libre' | 'compte'
  const [clients, setClients] = useState([]);
  const [acheteurId, setAcheteurId] = useState('');
  const [client, setClient] = useState({ prenom: '', nom: '', telephone: '', email: '' });
  const [livraison, setLivraison] = useState({
    modeLivraison: 'livraison', modePaiement: 'a_la_livraison', adresseLivraison: '', note: '',
  });
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  const chargerProduits = async (id) => {
    setProduits([]);
    if (!id) return;
    setChargement(true);
    try {
      const res = await getProduits({ boutiqueId: id, statut: 'disponibles' });
      setProduits(res.data?.produits || []);
    } catch {
      setProduits([]);
    } finally {
      setChargement(false);
    }
  };

  // Boutique déjà choisie dans le filtre de la page : ses produits d'emblée.
  useEffect(() => {
    if (!boutiqueParDefaut) return;
    getProduits({ boutiqueId: boutiqueParDefaut, statut: 'disponibles' })
      .then((res) => setProduits(res.data?.produits || []))
      .catch(() => setProduits([]))
      .finally(() => setChargement(false));
  }, [boutiqueParDefaut]);

  const choisirBoutique = (id) => {
    setBoutiqueId(id);
    setLignes([{ produitId: '', quantite: 1 }]);
    chargerProduits(id);
  };

  const choisirTypeClient = async (type) => {
    setTypeClient(type);
    if (type === 'compte' && clients.length === 0) {
      try {
        const res = await getClients();
        setClients((res.data?.clients || []).filter((c) => c.statut !== 'inactif'));
      } catch {
        setClients([]);
      }
    }
  };

  const changerLigne = (i, champ, valeur) =>
    setLignes((ls) => ls.map((l, j) => (j === i ? { ...l, [champ]: valeur } : l)));
  const ajouterLigne = () => setLignes((ls) => [...ls, { produitId: '', quantite: 1 }]);
  const retirerLigne = (i) => setLignes((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls));

  const produitDe = (id) => produits.find((p) => p.id === id);
  const sousTotal = lignes.reduce((t, l) => t + prixVente(produitDe(l.produitId)) * (Number(l.quantite) || 0), 0);

  const valider = () => {
    const e = {};
    if (!boutiqueId) e.boutiqueId = 'Choisissez la boutique';
    const utiles = lignes.filter((l) => l.produitId);
    if (utiles.length === 0) e.lignes = 'Ajoutez au moins un produit';
    utiles.forEach((l) => {
      const p = produitDe(l.produitId);
      const q = Number(l.quantite);
      if (!Number.isInteger(q) || q < 1) e.lignes = 'Quantité invalide';
      else if (p && q > Number(p.quantite)) e.lignes = `Stock insuffisant pour « ${p.nom} » (reste ${p.quantite})`;
    });
    if (typeClient === 'compte' && !acheteurId) e.client = 'Choisissez le client';
    if (typeClient === 'libre') {
      if (!client.nom.trim()) e.nom = 'Requis';
      if (!/^\+?\d{7,15}$/.test(client.telephone.replace(/[\s.-]/g, ''))) e.telephone = 'Téléphone invalide';
    }
    if (livraison.modeLivraison === 'livraison' && !livraison.adresseLivraison.trim()) {
      e.adresseLivraison = 'Adresse requise pour une livraison';
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const creer = async () => {
    if (!valider()) return;
    setEnvoi(true);
    try {
      await onCreer({
        boutiqueId,
        items: lignes.filter((l) => l.produitId).map((l) => ({ produitId: l.produitId, quantite: Number(l.quantite) })),
        ...(typeClient === 'compte' ? { acheteurId } : { client: { ...client, nom: client.nom.trim() } }),
        ...livraison,
      });
    } finally {
      setEnvoi(false);
    }
  };

  const changerClient = (champ) => (e) => setClient((c) => ({ ...c, [champ]: e.target.value }));
  const changerLivraison = (champ) => (e) => setLivraison((l) => ({ ...l, [champ]: e.target.value }));

  return (
    <Modal
      isOpen={ouvert}
      onClose={onFermer}
      large
      title="Nouvelle commande"
      footer={(
        <>
          <button className="btn btn-secondary" onClick={onFermer} disabled={envoi}>Annuler</button>
          <button className="btn btn-primary" onClick={creer} disabled={envoi}>
            {envoi ? 'Création…' : 'Créer la commande'}
          </button>
        </>
      )}
    >
      <div className="form-field">
        <label className="form-label" htmlFor="cmd-boutique">Boutique<span className="champ-requis"> *</span></label>
        <select id="cmd-boutique" className="form-select" value={boutiqueId} onChange={(e) => choisirBoutique(e.target.value)}>
          <option value="">Choisir la boutique…</option>
          {boutiques.map((b) => <option key={b.id} value={b.id}>{libelleBoutique(b)}</option>)}
        </select>
        {erreurs.boutiqueId && <p className="form-error">{erreurs.boutiqueId}</p>}
      </div>

      <div className="form-field">
        <label className="form-label">Articles<span className="champ-requis"> *</span></label>
        {!boutiqueId ? (
          <p className="form-hint">Choisissez d&apos;abord la boutique.</p>
        ) : chargement ? (
          <p className="form-hint">Chargement des produits…</p>
        ) : produits.length === 0 ? (
          <p className="form-hint">Cette boutique n&apos;a aucun produit en vente.</p>
        ) : (
          <>
            {lignes.map((l, i) => (
              <div className="ligne-article" key={i}>
                <select
                  className="form-select" value={l.produitId} aria-label="Produit"
                  onChange={(e) => changerLigne(i, 'produitId', e.target.value)}
                >
                  <option value="">Choisir un produit…</option>
                  {produits.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} — {formatMontant(prixVente(p))} (stock {p.quantite})
                    </option>
                  ))}
                </select>
                <input
                  type="number" min="1" className="form-input ligne-article-qte" aria-label="Quantité"
                  value={l.quantite} onChange={(e) => changerLigne(i, 'quantite', e.target.value)}
                />
                <button
                  type="button" className="btn btn-ghost btn-sm" onClick={() => retirerLigne(i)}
                  disabled={lignes.length === 1} aria-label="Retirer l'article"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="ligne-article-pied">
              <button type="button" className="btn btn-ghost btn-sm" onClick={ajouterLigne}>+ Ajouter un article</button>
              <span className="td-bold">Sous-total : {formatMontant(sousTotal)}</span>
            </div>
          </>
        )}
        {erreurs.lignes && <p className="form-error">{erreurs.lignes}</p>}
      </div>

      <div className="form-field">
        <label className="form-label">Client<span className="champ-requis"> *</span></label>
        <div className="filtres-statut">
          <button type="button" className={`filtre-statut${typeClient === 'libre' ? ' actif' : ''}`} onClick={() => choisirTypeClient('libre')}>
            Client sans compte
          </button>
          <button type="button" className={`filtre-statut${typeClient === 'compte' ? ' actif' : ''}`} onClick={() => choisirTypeClient('compte')}>
            Client inscrit
          </button>
        </div>
      </div>

      {typeClient === 'compte' ? (
        <div className="form-field">
          <select className="form-select" value={acheteurId} onChange={(e) => setAcheteurId(e.target.value)} aria-label="Client inscrit">
            <option value="">Choisir le client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{`${c.prenom || ''} ${c.nom || ''}`.trim()} — {c.telephone || c.email}</option>
            ))}
          </select>
          {erreurs.client && <p className="form-error">{erreurs.client}</p>}
        </div>
      ) : (
        <div className="form-grille-2">
          <FormField label="Prénom" name="cmd-prenom" value={client.prenom} onChange={changerClient('prenom')} />
          <FormField label="Nom" name="cmd-nom" value={client.nom} onChange={changerClient('nom')} error={erreurs.nom} required />
          <FormField label="Téléphone" name="cmd-tel" value={client.telephone} onChange={changerClient('telephone')} error={erreurs.telephone} required placeholder="77 123 45 67" />
          <FormField label="Email" name="cmd-email" type="email" value={client.email} onChange={changerClient('email')} placeholder="Optionnel" />
        </div>
      )}

      <div className="form-grille-2">
        <div className="form-field">
          <label className="form-label" htmlFor="cmd-livraison">Mode de remise</label>
          <select id="cmd-livraison" className="form-select" value={livraison.modeLivraison} onChange={changerLivraison('modeLivraison')}>
            {MODES_LIVRAISON.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="cmd-paiement">Paiement</label>
          <select id="cmd-paiement" className="form-select" value={livraison.modePaiement} onChange={changerLivraison('modePaiement')}>
            {MODES_PAIEMENT.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>
      {livraison.modeLivraison === 'livraison' && (
        <FormField label="Adresse de livraison" name="cmd-adresse" value={livraison.adresseLivraison} onChange={changerLivraison('adresseLivraison')} error={erreurs.adresseLivraison} required placeholder="Quartier, ville" />
      )}
      <FormField label="Note" name="cmd-note" as="textarea" value={livraison.note} onChange={changerLivraison('note')} placeholder="Optionnel" />
      <p className="form-hint">Les frais de livraison sont ajoutés par le serveur selon la configuration.</p>
    </Modal>
  );
}

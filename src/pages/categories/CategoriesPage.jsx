import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import FormField from '../../components/forms/FormField';
import SearchInput from '../../components/common/SearchInput';
import useCategories from './useCategories';
import { ICONES_CATEGORIES, libelleIcone } from './icones';
import EditeurSpecifications from './EditeurSpecifications';

/**
 * Catégories de la marketplace — un seul niveau, pas de sous-rayons.
 * L'ordre de cette liste est celui de la rangée de catégories de l'accueil
 * de l'application.
 */
export default function CategoriesPage() {
  useTitrePage('Catégories — SaamBiz Admin');
  const c = useCategories();

  if (c.loading) return <LoadingSpinner />;

  const cible = c.cibleSuppression;
  const cibleUtilisee = cible && ((cible.nombreProduits || 0) + (cible.nombreBoutiques || 0) > 0);
  const enRecherche = Boolean((c.rechercheDifferee || '').trim());

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Catégories</h1>
          <p>
            {c.triees.length} catégorie(s)
            {c.nbMasquees > 0 && ` · ${c.nbMasquees} masquée(s)`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={c.ouvrirCreation}>
          + Ajouter une catégorie
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Ordre d'affichage dans l'application</span>
          <SearchInput value={c.search} onChange={c.rechercher} placeholder="Rechercher…" />
        </div>
        <p className="form-hint cat-aide">
          Une boutique choisit 1 à 3 catégories, un produit une seule. Une catégorie masquée
          disparaît de l'application sans toucher à ses produits ni à ses boutiques.
          {enRecherche && ' Effacez la recherche pour changer l\'ordre.'}
        </p>

        <div className="table-wrap">
          <table className="data-table cat-table">
            <thead>
              <tr>
                <th className="cat-col-ordre">Ordre</th>
                <th>Catégorie</th>
                <th>Icône</th>
                <th className="cat-col-nombre">Caract.</th>
                <th className="cat-col-nombre">Boutiques</th>
                <th className="cat-col-nombre">Produits</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {c.affichees.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <p>
                        {enRecherche
                          ? `Aucun résultat pour « ${c.rechercheDifferee} »`
                          : 'Aucune catégorie enregistrée pour l’instant'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : c.affichees.map((cat, i) => (
                <tr key={cat.id} className={cat.active ? '' : 'cat-ligne-masquee'}>
                  <td>
                    <div className="cat-ordre">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => c.deplacer(cat, -1)}
                        disabled={enRecherche || c.deplacement || i === 0}
                        aria-label={`Monter ${cat.nom}`}
                        title="Monter"
                      >↑</button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => c.deplacer(cat, 1)}
                        disabled={enRecherche || c.deplacement || i === c.affichees.length - 1}
                        aria-label={`Descendre ${cat.nom}`}
                        title="Descendre"
                      >↓</button>
                    </div>
                  </td>
                  <td>
                    <div className="td-bold">{cat.nom}</div>
                    <div className="td-muted cat-sous">
                      {cat.description || 'Sans description'}
                      {cat.slug && <span className="cat-slug"> · {cat.slug}</span>}
                    </div>
                  </td>
                  <td className="td-muted">{libelleIcone(cat.icone)}</td>
                  <td className="cat-col-nombre" title={(cat.specifications || []).map((s) => s.libelle).join(', ')}>
                    {(cat.specifications || []).length}
                  </td>
                  <td className="cat-col-nombre">{cat.nombreBoutiques ?? 0}</td>
                  <td className="cat-col-nombre">{cat.nombreProduits ?? 0}</td>
                  <td>
                    <Badge variant={cat.active ? 'success' : 'default'}>
                      {cat.active ? 'Visible' : 'Masquée'}
                    </Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => c.ouvrirEdition(cat)}>
                        Modifier
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => c.basculerVisibilite(cat)}>
                        {cat.active ? 'Masquer' : 'Afficher'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => c.demanderSuppression(cat)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Création / modification ─────────────────────────────────────── */}
      <Modal
        isOpen={c.formulaireOuvert}
        onClose={c.fermerFormulaire}
        large
        title={c.cibleEdition ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={c.fermerFormulaire} disabled={c.enregistrement}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={c.enregistrer} disabled={c.enregistrement}>
              {c.enregistrement ? 'Sauvegarde…' : (c.cibleEdition ? 'Enregistrer' : 'Créer')}
            </button>
          </>
        )}
      >
        <FormField
          label="Nom" name="nom" value={c.formulaire.nom} onChange={c.changerChamp}
          error={c.erreurs.nom} required placeholder="Ex. Mode femme"
        />
        {c.cibleEdition && c.formulaire.nom.trim() !== c.cibleEdition.nom && (
          <p className="form-hint cat-aide-champ">
            Le nouveau nom s'applique partout : boutiques, produits et centres d'intérêt des clients.
          </p>
        )}
        <FormField
          label="Description" name="description" as="textarea"
          value={c.formulaire.description} onChange={c.changerChamp}
          placeholder="Ce qu'on y trouve (affiché dans l'application)"
        />
        <div className="form-field">
          <label className="form-label" htmlFor="icone">Icône</label>
          <select
            id="icone" name="icone" className="form-select"
            value={c.formulaire.icone} onChange={c.changerChamp}
          >
            <option value="">Icône par défaut</option>
            {ICONES_CATEGORIES.map((i) => (
              <option key={i.valeur} value={i.valeur}>{i.libelle}</option>
            ))}
          </select>
        </div>
        <FormField
          label="Image (facultatif)" name="image" value={c.formulaire.image}
          onChange={c.changerChamp} error={c.erreurs.image}
          placeholder="https://… — visuel de la tuile sur l'accueil"
        />
        <label className="cat-case">
          <input type="checkbox" name="active" checked={c.formulaire.active} onChange={c.changerChamp} />
          Visible dans l'application
        </label>
        <EditeurSpecifications lignes={c.formulaire.specifications} onChange={c.changerSpecifications} />
      </Modal>

      {/* ── Suppression / fusion ────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(cible)}
        onClose={c.annulerSuppression}
        title={cibleUtilisee ? 'Supprimer et transférer' : 'Supprimer la catégorie'}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={c.annulerSuppression} disabled={c.suppression}>
              Annuler
            </button>
            <button
              className="btn btn-danger"
              onClick={c.supprimer}
              disabled={c.suppression || (cibleUtilisee && !c.remplacerPar)}
            >
              {c.suppression ? 'Suppression…' : (cibleUtilisee ? 'Transférer et supprimer' : 'Supprimer')}
            </button>
          </>
        )}
      >
        {cible && (cibleUtilisee ? (
          <>
            <p className="message-confirmation">
              « {cible.nom} » est utilisée par {cible.nombreProduits || 0} produit(s)
              et {cible.nombreBoutiques || 0} boutique(s). Choisissez la catégorie qui les reprend.
            </p>
            <div className="form-field">
              <label className="form-label" htmlFor="remplacerPar">
                Transférer vers<span className="champ-requis"> *</span>
              </label>
              <select
                id="remplacerPar" className="form-select"
                value={c.remplacerPar} onChange={(e) => c.setRemplacerPar(e.target.value)}
              >
                <option value="">Choisir une catégorie…</option>
                {c.triees.filter((x) => x.id !== cible.id).map((x) => (
                  <option key={x.id} value={x.id}>{x.nom}{x.active ? '' : ' (masquée)'}</option>
                ))}
              </select>
            </div>
            <p className="form-hint">
              Pour la retirer de l'application sans rien déplacer, utilisez plutôt « Masquer ».
            </p>
          </>
        ) : (
          <p className="message-confirmation">
            Supprimer la catégorie « {cible.nom} » ? Elle n'est utilisée par aucun produit ni aucune boutique.
          </p>
        ))}
      </Modal>
    </div>
  );
}

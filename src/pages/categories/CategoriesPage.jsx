import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import FormField from '../../components/forms/FormField';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatters';
import useCategories from './useCategories';

/** Catégories de produits de la marketplace. */
export default function CategoriesPage() {
  const c = useCategories();

  if (c.loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Catégories — SaamBiz Admin</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Catégories</h1>
          <p>{c.elements.length} catégorie(s) au total</p>
        </div>
        <button className="btn btn-primary" onClick={c.ouvrirCreation}>
          + Ajouter une catégorie
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des catégories</span>
          <SearchInput value={c.search} onChange={c.rechercher} placeholder="Rechercher…" />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Créée le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {c.pageCourante.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <p>
                        {c.rechercheDifferee
                          ? `Aucun résultat pour « ${c.rechercheDifferee} »`
                          : 'Aucune catégorie enregistrée pour l’instant'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : c.pageCourante.map((cat) => (
                <tr key={cat.id}>
                  <td className="td-bold">{cat.nom}</td>
                  <td className="td-muted">{cat.description || '—'}</td>
                  <td className="td-muted">{formatDate(cat.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => c.ouvrirEdition(cat)}>
                        Modifier
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => c.setCibleSuppression(cat)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bloc-pagination">
          <Pagination currentPage={c.page} totalPages={c.totalPages} onPageChange={c.setPage} />
        </div>
      </div>

      <Modal
        isOpen={c.formulaireOuvert}
        onClose={c.fermerFormulaire}
        title={c.cibleEdition ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        footer={(
          <>
            <button
              className="btn btn-secondary"
              onClick={c.fermerFormulaire}
              disabled={c.enregistrement}
            >
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
          error={c.erreurs.nom} required placeholder="Nom de la catégorie"
        />
        <FormField
          label="Description" name="description" as="textarea"
          value={c.formulaire.description} onChange={c.changerChamp}
          placeholder="Description (optionnelle)"
        />
      </Modal>

      <ConfirmModal
        isOpen={Boolean(c.cibleSuppression)}
        onClose={() => c.setCibleSuppression(null)}
        onConfirm={c.supprimer}
        title="Supprimer la catégorie"
        message={`Voulez-vous supprimer la catégorie « ${c.cibleSuppression?.nom} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}

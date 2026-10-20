import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import AvatarPersonne from '../../components/common/AvatarPersonne';
import FiltresStatut from '../../components/common/FiltresStatut';
import { formatDateTime } from '../../utils/formatters';
import useAudit from './useAudit';
import {
  PERIODES, CIBLES, libelleAction, libelleCible, nomAdmin, ilYA,
} from './libelles';

const CHIFFRES = [
  { cle: 'actions', libelle: 'Actions', aide: 'Créations, modifications, suppressions…' },
  { cle: 'connexions', libelle: 'Connexions', aide: 'Ouvertures de session au dashboard' },
  { cle: 'suppressions', libelle: 'Suppressions', aide: 'Comptes, produits, commandes…' },
  { cle: 'adminsActifs', libelle: 'Admins actifs', aide: 'Au moins une action sur la période' },
];

/** Détails d'une action, présentés clé / valeur. */
function Details({ log }) {
  const details = log?.details && typeof log.details === 'object' ? log.details : null;
  const lignes = details ? Object.entries(details).filter(([, v]) => v !== undefined && v !== null && v !== '') : [];
  return (
    <div className="detail-grid">
      <div className="detail-item"><label>Date</label><span>{formatDateTime(log.createdAt)}</span></div>
      <div className="detail-item"><label>Administrateur</label><span>{nomAdmin(log.admin)}</span></div>
      <div className="detail-item"><label>Action</label><span>{libelleAction(log.action).texte}</span></div>
      <div className="detail-item"><label>Élément</label><span>{libelleCible(log.cible)}</span></div>
      {log.cibleId && (
        <div className="detail-item full"><label>Identifiant</label><span className="texte-code">{log.cibleId}</span></div>
      )}
      {lignes.map(([cle, valeur]) => (
        <div className="detail-item full" key={cle}>
          <label>{cle}</label>
          <span>{typeof valeur === 'object' ? JSON.stringify(valeur) : String(valeur)}</span>
        </div>
      ))}
      {!details && typeof log.details === 'string' && (
        <div className="detail-item full"><label>Détails</label><span>{log.details}</span></div>
      )}
    </div>
  );
}

/** Activité des administrateurs : qui a fait quoi, et quand. */
export default function AuditPage() {
  useTitrePage('Activité des admins — SaamBiz Admin');
  const a = useAudit();
  const j = a.journal;
  const chiffres = a.resume?.chiffres || {};
  const admins = a.resume?.admins || [];
  const adminChoisi = admins.find((x) => x.id === a.adminId);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Activité des administrateurs</h1>
          <p>Toutes les actions faites sur le dashboard, et par qui</p>
        </div>
        <FiltresStatut options={PERIODES} valeur={a.periode} onChange={a.choisirPeriode} />
      </div>

      <div className="stats-grid stats-grid-4">
        {CHIFFRES.map((c) => (
          <div className="stat-card" key={c.cle}>
            <div className="stat-card-value">{a.chargementResume ? '…' : (chiffres[c.cle] ?? 0)}</div>
            <div className="stat-card-label">{c.libelle}</div>
            <div className="stat-card-aide">{c.aide}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Par administrateur</span>
          {a.adminId && (
            <button className="lien-voir-tout bouton-lien" onClick={() => a.choisirAdmin('')}>Tous les admins</button>
          )}
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Administrateur</th>
                <th>Actions</th>
                <th>Connexions</th>
                <th>Dernière action</th>
                <th>Dernière connexion</th>
              </tr>
            </thead>
            <tbody>
              {a.chargementResume ? (
                <tr><td colSpan={5}><LoadingSpinner /></td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><p>Aucun administrateur</p></div></td></tr>
              ) : admins.map((ad) => (
                <tr
                  key={ad.id}
                  className={`ligne-cliquable${a.adminId === ad.id ? ' ligne-choisie' : ''}`}
                  onClick={() => a.choisirAdmin(a.adminId === ad.id ? '' : ad.id)}
                  title="Voir son activité"
                >
                  <td>
                    <div className="cellule-personne">
                      <AvatarPersonne personne={ad} />
                      <div>
                        <div className="td-bold">{nomAdmin(ad)}</div>
                        <div className="td-muted td-petit">{ad.role === 'SuperAdmin' ? 'Super admin' : ad.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="td-bold">{ad.actions - ad.connexions}</td>
                  <td className="td-muted">{ad.connexions}</td>
                  <td className="td-muted">{ilYA(ad.derniereAction)}</td>
                  <td className="td-muted">{ad.derniereConnexion ? ilYA(ad.derniereConnexion) : 'Jamais'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header card-header-recherche">
          <SearchInput value={j.search} onChange={j.rechercher} placeholder="Rechercher une action, un élément…" />
          <div className="groupe-filtres">
            <select
              className="form-select filter-select"
              value={a.adminId}
              onChange={(e) => a.choisirAdmin(e.target.value)}
              aria-label="Filtrer par administrateur"
            >
              <option value="">Tous les admins</option>
              {admins.map((ad) => <option key={ad.id} value={ad.id}>{nomAdmin(ad)}</option>)}
            </select>
            <select
              className="form-select filter-select"
              value={a.cible}
              onChange={(e) => a.choisirType(e.target.value)}
              aria-label="Filtrer par type d'élément"
            >
              <option value="">Tous les éléments</option>
              {Object.entries(CIBLES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        {j.loading ? <LoadingSpinner /> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Administrateur</th>
                  <th>Action</th>
                  <th>Élément</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {j.pageCourante.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <p>
                          {adminChoisi
                            ? `Aucune activité de ${nomAdmin(adminChoisi)} sur cette période`
                            : 'Aucune activité sur cette période'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : j.pageCourante.map((l) => {
                  const act = libelleAction(l.action);
                  const resumeDetails = l.details && typeof l.details === 'object'
                    ? (l.details.nom || l.details.email || l.details.reference || l.details.statut || '')
                    : '';
                  return (
                    <tr key={l.id}>
                      <td className="td-muted" title={formatDateTime(l.createdAt)}>
                        <div>{ilYA(l.createdAt)}</div>
                        <div className="td-petit">{formatDateTime(l.createdAt)}</div>
                      </td>
                      <td>
                        <div className="cellule-personne">
                          <AvatarPersonne personne={l.admin || {}} />
                          <span className="td-bold">{nomAdmin(l.admin)}</span>
                        </div>
                      </td>
                      <td><Badge variant={act.ton}>{act.texte}</Badge></td>
                      <td>
                        <div className="td-bold">{libelleCible(l.cible)}</div>
                        {resumeDetails && <div className="td-muted td-petit">{String(resumeDetails)}</div>}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => a.voirDetail(l)}>Voir</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="bloc-pagination">
          <Pagination currentPage={j.page} totalPages={j.totalPages} onPageChange={j.setPage} />
        </div>
      </div>

      <Modal
        isOpen={Boolean(a.detail)}
        onClose={a.fermerDetail}
        title="Détail de l'action"
        footer={<button className="btn btn-secondary" onClick={a.fermerDetail}>Fermer</button>}
      >
        {a.detail && <Details log={a.detail} />}
      </Modal>
    </div>
  );
}

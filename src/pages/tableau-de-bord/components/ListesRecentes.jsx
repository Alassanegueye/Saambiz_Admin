import Badge from '../../../components/common/Badge';
import { formatDate } from '../../../utils/formatters';

/** Cinq derniers vendeurs inscrits, avec leur état d'activation. */
export function VendeursRecents({ vendeurs }) {
  return (
    <div className="card">
      <div className="card-header"><span className="card-title">Vendeurs récents</span></div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Nom</th><th>Email</th><th>Statut</th></tr></thead>
          <tbody>
            {vendeurs.length === 0 ? (
              <tr><td colSpan={3} className="cellule-vide">Aucun vendeur</td></tr>
            ) : vendeurs.map((v) => (
              <tr key={v.id}>
                <td className="td-bold">{v.prenom} {v.nom}</td>
                <td className="td-muted">{v.email || '—'}</td>
                <td>
                  <Badge variant={v.actif ? 'success' : 'default'}>
                    {v.actif ? 'Actif' : 'Inactif'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Cinq derniers clients inscrits, avec leur date d'inscription. */
export function ClientsRecents({ clients }) {
  return (
    <div className="card">
      <div className="card-header"><span className="card-title">Clients récents</span></div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Nom</th><th>Email</th><th>Inscription</th></tr></thead>
          <tbody>
            {clients.length === 0 ? (
              <tr><td colSpan={3} className="cellule-vide">Aucun client</td></tr>
            ) : clients.map((c) => (
              <tr key={c.id}>
                <td className="td-bold">{c.prenom} {c.nom}</td>
                <td className="td-muted">{c.email || '—'}</td>
                <td className="td-muted">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

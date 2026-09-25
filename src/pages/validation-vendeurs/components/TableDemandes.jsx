import { formatDateTime } from '../../../utils/formatters';

/** Une demande par ligne, avec le nécessaire pour trancher sans changer de page. */
export default function TableDemandes({ vendeurs, onVoirPiece, onApprouver, onRejeter }) {
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vendeur</th>
              <th>Boutique</th>
              <th>Pièce fournie</th>
              <th>Demande reçue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendeurs.map((v) => {
              const boutique = v.boutiques?.[0];
              return (
                <tr key={v.id}>
                  <td>
                    <div className="td-bold">{`${v.prenom || ''} ${v.nom || ''}`.trim()}</div>
                    <div className="td-muted td-meta">{v.email}</div>
                    {v.telephone && <div className="td-muted td-meta">{v.telephone}</div>}
                  </td>
                  <td>
                    {boutique ? (
                      <>
                        <div className="td-bold">{boutique.nom}</div>
                        <div className="td-muted td-meta">
                          {[boutique.categorie, boutique.localisation].filter(Boolean).join(' · ')}
                        </div>
                      </>
                    ) : (
                      <span className="td-muted">Aucune boutique créée</span>
                    )}
                  </td>
                  <td>
                    {v.pieceIdentite ? (
                      <button className="btn btn-ghost btn-sm" onClick={() => onVoirPiece(v)}>
                        {v.typePiece || 'Voir la pièce'}
                      </button>
                    ) : (
                      <span className="td-muted">—</span>
                    )}
                  </td>
                  <td className="td-muted">{formatDateTime(v.dateSoumission)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-success btn-sm" onClick={() => onApprouver(v)}>
                        Approuver
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => onRejeter(v)}>
                        Rejeter
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

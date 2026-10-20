import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import useValidationVendeurs from './useValidationVendeurs';
import TableDemandes from './components/TableDemandes';

/** File d'attente des profils vendeurs à examiner. */
export default function ValidationVendeursPage() {
  useTitrePage('Validation des vendeurs — SaamBiz Admin');
  const v = useValidationVendeurs();

  if (v.loading) return <LoadingSpinner fullPage />;

  const nombre = v.vendeurs.length;
  const apercu = v.apercu;
  const nomApercu = `${apercu?.prenom || ''} ${apercu?.nom || ''}`.trim();

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Validation des vendeurs</h1>
          <p>
            {nombre === 0
              ? 'Aucune demande en attente'
              : `${nombre} profil${nombre > 1 ? 's' : ''} en attente d’examen`}
          </p>
        </div>
      </div>

      {nombre === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <p>Tout est traité. Les nouvelles demandes apparaîtront ici.</p>
            </div>
          </div>
        </div>
      ) : (
        <TableDemandes
          vendeurs={v.vendeurs}
          onVoirPiece={v.setApercu}
          onApprouver={v.setAValider}
          onRejeter={v.ouvrirRejet}
        />
      )}

      {/* Aperçu de la pièce : l'administrateur doit pouvoir la lire avant de
          trancher, sans quitter la file d'attente. */}
      <Modal
        isOpen={apercu !== null}
        onClose={() => v.setApercu(null)}
        title={`Pièce fournie — ${nomApercu}`}
      >
        {apercu?.pieceIdentite && (
          <>
            <img
              className="apercu-piece"
              src={apercu.pieceIdentite}
              alt="Pièce justificative transmise par le vendeur"
            />
            <p className="note-modale">
              Vérifiez que le nom sur la pièce correspond à celui du compte ({nomApercu}).
            </p>
          </>
        )}
      </Modal>

      <ConfirmModal
        isOpen={v.aValider !== null}
        onClose={() => v.setAValider(null)}
        onConfirm={v.valider}
        title="Approuver le profil"
        message={`La boutique de ${v.aValider?.prenom || ''} ${v.aValider?.nom || ''} recevra le badge « vérifiée » et sera mise en avant auprès des clients.`}
        confirmLabel="Approuver"
        variant="warning"
      />

      <Modal
        isOpen={v.aRejeter !== null}
        onClose={() => v.setARejeter(null)}
        title="Rejeter le profil"
        footer={(
          <>
            <button
              className="btn btn-secondary"
              onClick={() => v.setARejeter(null)}
              disabled={v.enregistrement}
            >
              Annuler
            </button>
            <button className="btn btn-danger" onClick={v.rejeter} disabled={v.enregistrement}>
              {v.enregistrement ? 'Envoi…' : 'Rejeter'}
            </button>
          </>
        )}
      >
        <div className="form-field">
          <label className="form-label" htmlFor="motif-rejet">Motif du rejet</label>
          <textarea
            id="motif-rejet"
            className="form-textarea"
            rows={4}
            value={v.motif}
            onChange={(e) => v.setMotif(e.target.value)}
            placeholder="Ex. La pièce est illisible, ou le nom ne correspond pas au compte."
          />
          <span className="form-hint">
            Ce message est affiché au vendeur : rédigez-le pour qu’il sache quoi corriger.
          </span>
        </div>
      </Modal>
    </div>
  );
}

import LoadingSpinner from '../../../components/common/LoadingSpinner';

/** Magasin clé/valeur des paramètres généraux de la plateforme. */
export default function ListeConfigs({ configs, chargement, onAjouter, onModifier }) {
  return (
    <div className="card carte-large">
      <div className="card-header">
        <span className="card-title">Configurations générales</span>
        <button className="btn btn-primary btn-sm" onClick={onAjouter}>+ Ajouter</button>
      </div>

      {chargement ? <LoadingSpinner /> : (
        configs.length === 0 ? (
          <div className="empty-state">
            <p>Aucune configuration enregistrée pour l&apos;instant</p>
          </div>
        ) : (
          <div>
            {configs.map((cfg) => (
              <div className="config-list-item" key={cfg.cle}>
                <div>
                  <div className="config-list-item-key">{cfg.cle}</div>
                  {cfg.description && (
                    <div className="config-list-item-desc">{cfg.description}</div>
                  )}
                </div>
                <div className="config-list-item-actions">
                  <span className="config-list-item-value">{cfg.valeur}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => onModifier(cfg)}>
                    Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

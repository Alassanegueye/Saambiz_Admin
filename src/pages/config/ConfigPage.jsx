import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import Modal from '../../components/common/Modal';
import FormField from '../../components/forms/FormField';
import { formatMontant } from '../../utils/formatters';
import useConfig from './useConfig';
import CartePrixAbonnement from './components/CartePrixAbonnement';
import ListeConfigs from './components/ListeConfigs';

/** Paramètres de la plateforme : prix de l'abonnement et configurations générales. */
export default function ConfigPage() {
  useTitrePage('Configuration — SaamBiz Admin');
  const c = useConfig();

  if (c.loading) return <LoadingSpinner />;

  const confirmerPrix = () => {
    c.setConfirmationOuverte(false);
    c.enregistrerPrix();
  };

  return (
    <div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Configuration</h1>
          <p>Paramètres de la plateforme</p>
        </div>
      </div>

      <CartePrixAbonnement
        prixActuel={c.prixActuel}
        nouveauPrix={c.nouveauPrix}
        onChangerPrix={c.setNouveauPrix}
        enregistrement={c.enregistrementPrix}
        onDemanderEnregistrement={() => c.setConfirmationOuverte(true)}
        onAnnuler={c.annulerPrix}
      />

      <ConfirmModal
        isOpen={c.confirmationOuverte}
        onClose={() => c.setConfirmationOuverte(false)}
        onConfirm={confirmerPrix}
        title="Modifier le prix"
        message={`Voulez-vous modifier le prix de l'abonnement à ${formatMontant(parseFloat(c.nouveauPrix) || 0)} ?`}
        confirmLabel="Confirmer"
        variant="warning"
      />

      <ListeConfigs
        configs={c.configs}
        chargement={c.loadingConfigs}
        onAjouter={c.ouvrirCreationConfig}
        onModifier={c.ouvrirEditionConfig}
      />

      <Modal
        isOpen={c.formulaireOuvert}
        onClose={c.fermerFormulaire}
        title={c.cibleEdition ? `Modifier « ${c.cibleEdition.cle} »` : 'Nouvelle configuration'}
        footer={(
          <>
            <button
              className="btn btn-secondary"
              onClick={c.fermerFormulaire}
              disabled={c.enregistrementConfig}
            >
              Annuler
            </button>
            <button
              className="btn btn-primary"
              onClick={c.enregistrerConfig}
              disabled={c.enregistrementConfig}
            >
              {c.enregistrementConfig
                ? 'Sauvegarde…'
                : (c.cibleEdition ? 'Enregistrer' : 'Créer')}
            </button>
          </>
        )}
      >
        <FormField
          label="Clé" name="cle" value={c.formulaire.cle} onChange={c.changerChamp}
          error={c.erreurs.cle} required placeholder="ex : contact_email"
          disabled={Boolean(c.cibleEdition)}
        />
        <FormField
          label="Valeur" name="valeur" value={c.formulaire.valeur} onChange={c.changerChamp}
          error={c.erreurs.valeur} required placeholder="Valeur de la configuration"
        />
        <FormField
          label="Description" name="description" as="textarea"
          value={c.formulaire.description} onChange={c.changerChamp}
          placeholder="Description (optionnelle)"
        />
      </Modal>
    </div>
  );
}

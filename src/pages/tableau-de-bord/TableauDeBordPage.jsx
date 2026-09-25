import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MiniBarChart from '../../components/common/MiniBarChart';
import { formatMontant } from '../../utils/formatters';
import useTableauDeBord from './useTableauDeBord';
import CarteStat from './components/CarteStat';
import { VendeursRecents, ClientsRecents } from './components/ListesRecentes';
import {
  ICONE_BOUTIQUE, ICONE_BOUTIQUE_VIDE, ICONE_PERSONNE,
  ICONE_PANIER, ICONE_MONNAIE, ICONE_VALIDE,
} from './components/icones';

/** Vue d'ensemble de la plateforme. */
export default function TableauDeBordPage() {
  const t = useTableauDeBord();

  if (t.loading) return <LoadingSpinner />;

  const graphiquesDisponibles =
    t.revenusMensuels.length > 0 || t.inscriptionsMensuelles.length > 0;

  return (
    <>
      <Helmet><title>Vue d&apos;ensemble — SaamBiz Admin</title></Helmet>
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Vue d&apos;ensemble</h1>
            <p>Statistiques générales de la plateforme</p>
          </div>
        </div>

        <div className="stats-grid">
          <CarteStat label="Vendeurs actifs" valeur={t.stats?.vendeursActifs}
            couleur="green" icone={ICONE_BOUTIQUE} />
          <CarteStat label="Vendeurs inactifs" valeur={t.stats?.vendeursInactifs}
            couleur="gray" icone={ICONE_BOUTIQUE_VIDE} />
          <CarteStat label="Clients actifs" valeur={t.stats?.clientsActifs}
            couleur="blue" icone={ICONE_PERSONNE} />
          <CarteStat label="Clients inactifs" valeur={t.stats?.clientsInactifs}
            couleur="gold" icone={ICONE_PERSONNE} />
          <CarteStat label="Produits actifs" valeur={t.stats?.produitsActifs}
            couleur="red" icone={ICONE_PANIER} />
        </div>

        <div className="dashboard-grid">
          <VendeursRecents vendeurs={t.vendeurs} />
          <ClientsRecents clients={t.clients} />
        </div>

        {/* Les blocs suivants arrivent après le premier rendu : le second
            chargement est plus lent et ne doit pas bloquer la page. */}
        {!t.loadingAvance && t.statsEcommerce && (
          <div className="stats-grid">
            <CarteStat label="Commandes totales" valeur={t.statsEcommerce.commandes_total}
              couleur="blue" icone={ICONE_PANIER} />
            <CarteStat label="Montant total" valeur={formatMontant(t.statsEcommerce.montant_total)}
              couleur="green" icone={ICONE_MONNAIE} />
            <CarteStat label="Commandes livrées" valeur={t.statsEcommerce.commandes_livrees}
              couleur="gold" icone={ICONE_VALIDE} />
          </div>
        )}

        {!t.loadingAvance && graphiquesDisponibles && (
          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header"><span className="card-title">Revenus mensuels</span></div>
              <div className="card-body">
                <MiniBarChart
                  data={t.revenusMensuels}
                  labelKey="mois"
                  valueKey="revenu"
                  formatValue={formatMontant}
                />
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Inscriptions mensuelles</span>
              </div>
              <div className="card-body">
                <MiniBarChart data={t.inscriptionsMensuelles} labelKey="mois" valueKey="nombre" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

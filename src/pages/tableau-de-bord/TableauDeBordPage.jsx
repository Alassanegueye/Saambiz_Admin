import useTitrePage from '../../hooks/useTitrePage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MiniBarChart from '../../components/common/MiniBarChart';
import MiniBarres from '../../components/common/MiniBarres';
import { formatMontant } from '../../utils/formatters';
import useTableauDeBord from './useTableauDeBord';
import CarteStat from './components/CarteStat';
import { VendeursRecents, ClientsRecents } from './components/ListesRecentes';
import {
  ICONE_BOUTIQUE, ICONE_BOUTIQUE_VIDE, ICONE_PERSONNE,
  ICONE_PANIER, ICONE_MONNAIE, ICONE_VALIDE,
} from './components/icones';

/** « Mardi 3 novembre » */
function dateDuJour() {
  const texte = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** Vue d'ensemble de la plateforme. */
export default function TableauDeBordPage() {
  useTitrePage("Vue d'ensemble — SaamBiz Admin");
  const t = useTableauDeBord();

  if (t.loading) return <LoadingSpinner />;

  const graphiquesDisponibles =
    t.revenusMensuels.length > 0 || t.inscriptionsMensuelles.length > 0;
  const revenus = t.revenusMensuels.map((r) => Number(r.revenu) || 0);

  return (
    <>
      <div>
        {/* Bandeau d'accueil : la date, et le dernier mois de revenus avec
            ses petites barres or — celles du logo, tracées avec les vraies
            valeurs. Le chiffre arrive avec le second chargement. */}
        <section className="bandeau-accueil">
          <div className="bandeau-accueil__texte">
            <p className="bandeau-accueil__date">{dateDuJour()}</p>
            <h1>Vue d&apos;ensemble</h1>
            <p>Statistiques générales de la plateforme.</p>
          </div>
          {!t.loadingAvance && revenus.length > 0 && (
            <div className="bandeau-accueil__semaine">
              <span className="bandeau-accueil__libelle">Revenus du dernier mois</span>
              <strong className="bandeau-accueil__montant">{formatMontant(revenus[revenus.length - 1])}</strong>
              <MiniBarres
                valeurs={revenus}
                libelle={`Revenus mois par mois : ${t.revenusMensuels.map((r) => `${r.mois} ${formatMontant(r.revenu)}`).join(', ')}`}
              />
            </div>
          )}
        </section>

        <div className="stats-grid">
          <CarteStat label="Vendeurs actifs" to="/vendeurs?statut=actifs" valeur={t.stats?.vendeursActifs}
            couleur="green" icone={ICONE_BOUTIQUE} />
          <CarteStat label="Vendeurs inactifs" to="/vendeurs?statut=inactifs" valeur={t.stats?.vendeursInactifs}
            couleur="gray" icone={ICONE_BOUTIQUE_VIDE} />
          <CarteStat label="Clients actifs" to="/acheteurs?statut=actifs" valeur={t.stats?.clientsActifs}
            couleur="blue" icone={ICONE_PERSONNE} />
          <CarteStat label="Clients inactifs" to="/acheteurs?statut=inactifs" valeur={t.stats?.clientsInactifs}
            couleur="gold" icone={ICONE_PERSONNE} />
          <CarteStat label="Produits actifs" to="/produits?statut=disponibles" valeur={t.stats?.produitsActifs}
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
            <CarteStat label="Commandes totales" to="/commandes" valeur={t.statsEcommerce.commandes_total}
              couleur="blue" icone={ICONE_PANIER} />
            <CarteStat label="Montant total" to="/paiements" valeur={formatMontant(t.statsEcommerce.montant_total)}
              couleur="green" icone={ICONE_MONNAIE} />
            <CarteStat label="Commandes livrées" to="/commandes?statut=livree" valeur={t.statsEcommerce.commandes_livrees}
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

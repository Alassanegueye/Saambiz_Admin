import { GROUPES } from '../../../components/layouts/navigationAdmin';
import { ACTIONS } from '../useAdmins';

const CLES = ACTIONS.map((a) => a.cle);
const LIBELLE_GROUPE = { DASHBOARD: "Vue d'ensemble" };

/** Menus rangés comme dans la barre de navigation ; un code inconnu va dans « Autres ». */
function grouper(menus) {
  const ranges = new Set();
  const groupes = GROUPES.map((g) => {
    const liste = menus.filter((m) => g.codes.includes(m.code));
    liste.forEach((m) => ranges.add(m.id));
    return { label: g.label || LIBELLE_GROUPE[g.codes[0]] || g.codes[0], menus: liste };
  }).filter((g) => g.menus.length);
  const autres = menus.filter((m) => !ranges.has(m.id));
  if (autres.length) groupes.push({ label: 'Autres', menus: autres });
  return groupes;
}

/**
 * Choix des accès d'un administrateur, au style du dashboard Yobante
 * Boutique : « Accès complet » en tête, puis les pages regroupées comme dans
 * la barre de navigation. Cocher une page donne tous ses droits ; les
 * pastilles affinent (Voir, Créer, Modifier, Supprimer). Cliquer le titre
 * d'un groupe coche ou décoche tout le groupe.
 */
export default function GrillePermissions({ menus, permissions, onChange }) {
  const droits = (id) => permissions[id] || {};
  const tousDroits = (id) => CLES.every((c) => droits(id)[c]);
  const aucunDroit = (id) => CLES.every((c) => !droits(id)[c]);
  const complet = menus.length > 0 && menus.every((m) => tousDroits(m.id));

  const regler = (liste, valeur) => liste.forEach((m) => CLES.forEach((c) => onChange(m.id, c, valeur)));

  return (
    <div>
      <label className={`acces-complet${complet ? ' actif' : ''}`}>
        <input type="checkbox" checked={complet} onChange={(e) => regler(menus, e.target.checked)} />
        <span>
          <span className="acces-complet-titre">Accès complet</span>
          <span className="acces-complet-aide">
            Toutes les pages avec tous les droits, y compris la gestion des administrateurs.
          </span>
        </span>
      </label>

      <div className="acces-groupes">
        {grouper(menus).map((g) => (
          <div key={g.label} className="acces-groupe">
            <button
              type="button"
              className="acces-groupe-titre"
              title="Tout cocher / décocher"
              onClick={() => regler(g.menus, !g.menus.every((m) => tousDroits(m.id)))}
            >
              {g.label}
            </button>
            {g.menus.map((m) => (
              <div key={m.id} className="acces-page">
                <label className="acces-page-nom">
                  <input
                    type="checkbox"
                    checked={!aucunDroit(m.id)}
                    ref={(el) => { if (el) el.indeterminate = !aucunDroit(m.id) && !tousDroits(m.id); }}
                    onChange={() => regler([m], aucunDroit(m.id))}
                  />
                  {m.name}
                </label>
                {!aucunDroit(m.id) && (
                  <div className="acces-droits">
                    {ACTIONS.map(({ cle, label }) => (
                      <button
                        key={cle}
                        type="button"
                        className={`acces-droit${droits(m.id)[cle] ? ' actif' : ''}`}
                        aria-pressed={Boolean(droits(m.id)[cle])}
                        onClick={() => onChange(m.id, cle, !droits(m.id)[cle])}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

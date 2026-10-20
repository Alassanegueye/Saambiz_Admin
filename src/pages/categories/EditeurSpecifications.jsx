/**
 * Éditeur des spécifications produit d'une catégorie : ce que le vendeur
 * renseigne en ajoutant un produit (tailles, pointures, contenance…).
 * L'application et le dashboard vendeur construisent leur formulaire à
 * partir de cette liste ; le backend vérifie les valeurs.
 *
 * Les options s'éditent en texte, séparées par des virgules : c'est le plus
 * rapide pour une liste comme « XS, S, M, L, XL ».
 */

import { TYPES_SPECIFICATION, AVEC_OPTIONS } from './specifications';

export default function EditeurSpecifications({ lignes, onChange }) {
  const maj = (i, champ, valeur) => onChange(lignes.map((l, j) => (j === i ? { ...l, [champ]: valeur } : l)));
  const retirer = (i) => onChange(lignes.filter((_, j) => j !== i));
  const deplacer = (i, sens) => {
    const j = i + sens;
    if (j < 0 || j >= lignes.length) return;
    const copie = [...lignes];
    [copie[i], copie[j]] = [copie[j], copie[i]];
    onChange(copie);
  };
  const ajouter = () => onChange([...lignes, { libelle: '', type: 'variantes', options: '', libre: true }]);

  return (
    <div className="spec">
      <div className="spec-entete">
        <span className="form-label">Caractéristiques suggérées au vendeur</span>
        <span className="form-hint">
          Des cases vides bien nommées (Tailles, Parfums, Formats…) : le vendeur y tape ses propres
          valeurs et peut en ajouter d'autres. Inutile de tout prévoir.
        </span>
      </div>

      {lignes.length === 0 && (
        <p className="form-hint spec-vide">Aucune suggestion : le vendeur peut quand même ajouter ses propres options.</p>
      )}

      {lignes.map((l, i) => (
        <div className="spec-ligne" key={l.cle || `nouvelle-${i}`}>
          <div className="spec-rang">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => deplacer(i, -1)} disabled={i === 0} aria-label="Monter">↑</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => deplacer(i, 1)} disabled={i === lignes.length - 1} aria-label="Descendre">↓</button>
          </div>
          <div className="spec-champs">
            <div className="spec-duo">
              <input
                className="form-input" placeholder="Libellé (ex. Pointures disponibles)"
                value={l.libelle} onChange={(e) => maj(i, 'libelle', e.target.value)}
              />
              <select className="form-select" value={l.type} onChange={(e) => maj(i, 'type', e.target.value)}>
                {TYPES_SPECIFICATION.map((t) => <option key={t.valeur} value={t.valeur}>{t.libelle}</option>)}
              </select>
            </div>
            {AVEC_OPTIONS.includes(l.type) && (
              <input
                className="form-input"
                placeholder={l.type === 'variantes'
                  ? 'Propositions facultatives, séparées par des virgules (ex. S, M, L)'
                  : 'Valeurs séparées par des virgules (ex. Neuf, Occasion)'}
                value={l.options} onChange={(e) => maj(i, 'options', e.target.value)}
              />
            )}
            {l.type === 'nombre' && (
              <input
                className="form-input" placeholder="Unité (ex. kg, cm, ml)"
                value={l.unite || ''} onChange={(e) => maj(i, 'unite', e.target.value)}
              />
            )}
            <input
              className="form-input" placeholder="Exemple affiché au vendeur (ex. S, M, L, XL)"
              value={l.aide || ''} onChange={(e) => maj(i, 'aide', e.target.value)}
            />
            <div className="spec-options">
              <label><input type="checkbox" checked={!!l.obligatoire} onChange={(e) => maj(i, 'obligatoire', e.target.checked)} /> Obligatoire</label>
              <span className="form-hint">{TYPES_SPECIFICATION.find((t) => t.valeur === l.type)?.aide}</span>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm spec-retirer" onClick={() => retirer(i)} aria-label="Retirer">✕</button>
        </div>
      ))}

      <button type="button" className="btn btn-secondary btn-sm" onClick={ajouter}>+ Ajouter une caractéristique</button>
    </div>
  );
}

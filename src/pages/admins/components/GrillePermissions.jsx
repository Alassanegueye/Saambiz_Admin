import { memo } from 'react';
import { ACTIONS } from '../useAdmins';

/** Les quatre droits accordés sur un menu. */
const LignePermission = memo(function LignePermission({ menu, permission, onChange }) {
  return (
    <div className="perm-row">
      <span className="perm-menu-name">{menu.name}</span>
      <div className="perm-actions">
        {ACTIONS.map(({ cle, label }) => (
          <label key={cle} className="perm-checkbox">
            <input
              type="checkbox"
              checked={permission?.[cle] || false}
              onChange={(e) => onChange(menu.id, cle, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
});

/** Grille complète : une ligne de droits par menu. */
export default function GrillePermissions({ menus, permissions, onChange }) {
  return (
    <div className="perm-grid">
      {menus.map((menu) => (
        <LignePermission
          key={menu.id}
          menu={menu}
          permission={permissions[menu.id]}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

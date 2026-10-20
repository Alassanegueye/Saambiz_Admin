import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAuditLogs, getResumeActivite } from '../../service/auditLogs.service';
import useListeServeur from '../../hooks/useListeServeur';
import { debutPeriode, libelleAction, libelleCible, nomAdmin } from './libelles';

/**
 * Activité des administrateurs : résumé de la période (chiffres clés et une
 * ligne par admin) et journal paginé côté serveur. Les filtres vivent dans
 * l'adresse (?periode=30&admin=…&type=…) : un lien partagé rouvre la même vue.
 */
export default function useAudit() {
  const [params, setParams] = useSearchParams();
  const periode = ['7', '30', '90', 'tout'].includes(params.get('periode')) ? params.get('periode') : '30';
  const adminId = params.get('admin') || '';
  const cible = params.get('type') || '';
  const du = debutPeriode(periode);

  const majParam = useCallback((cle, valeur) => {
    setParams((p) => {
      const suivants = new URLSearchParams(p);
      if (valeur) suivants.set(cle, valeur); else suivants.delete(cle);
      return suivants;
    }, { replace: true });
  }, [setParams]);

  // ── Résumé de la période ──
  const [resume, setResume] = useState(null);
  const [chargementResume, setChargementResume] = useState(true);
  useEffect(() => {
    let actif = true;
    getResumeActivite(du ? { du } : {})
      .then((res) => { if (actif) setResume(res.data); })
      .catch(() => { if (actif) setResume(null); })
      .finally(() => { if (actif) setChargementResume(false); });
    return () => { actif = false; };
  }, [du]);

  // ── Journal ──
  const charger = useCallback(({ page, limit }) => getAuditLogs({
    page, limit,
    ...(du ? { du } : {}),
    ...(adminId ? { adminId } : {}),
    ...(cible ? { cible } : {}),
  }), [du, adminId, cible]);

  const journal = useListeServeur(charger, {
    extraire: (res) => res.data?.logs || [],
    extraireTotal: (res) => res.data?.total,
    filtrer: (l, s) =>
      nomAdmin(l.admin).toLowerCase().includes(s)
      || libelleAction(l.action).texte.toLowerCase().includes(s)
      || libelleCible(l.cible).toLowerCase().includes(s)
      || JSON.stringify(l.details || '').toLowerCase().includes(s),
    messageErreur: "Erreur lors du chargement de l'activité",
    taillePage: 20,
  });

  const changer = (cle) => (valeur) => {
    majParam(cle, valeur);
    journal.setPage(1);
  };

  const [detail, setDetail] = useState(null);

  return {
    periode, choisirPeriode: (v) => { if (v !== periode) setChargementResume(true); changer('periode')(v); },
    adminId, choisirAdmin: changer('admin'),
    cible, choisirType: changer('type'),
    resume, chargementResume,
    journal,
    detail, voirDetail: setDetail, fermerDetail: () => setDetail(null),
  };
}

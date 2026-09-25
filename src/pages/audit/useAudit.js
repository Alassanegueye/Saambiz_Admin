import { useState, useCallback } from 'react';
import { getAuditLogs } from '../../service/auditLogs.service';
import useListeFiltree from '../../hooks/useListeFiltree';
import useDebounce from '../../hooks/useDebounce';

/**
 * Contrôleur du journal d'audit.
 *
 * Deux filtres de nature différente : l'action est envoyée au serveur — la
 * table peut être volumineuse et on ne rapatrie pas tout —, la recherche
 * libre s'applique localement sur ce qui a été chargé.
 */
export default function useAudit() {
  const [actionFiltre, setActionFiltre] = useState('');
  const actionDifferee = useDebounce(actionFiltre, 300);

  const charger = useCallback(() => {
    const params = {};
    if (actionDifferee) params.action = actionDifferee;
    return getAuditLogs(params);
  }, [actionDifferee]);

  const liste = useListeFiltree(charger, {
    extraire: (res) => res.data?.logs || res.data?.data || res.data || [],
    filtrer: (l, s) =>
      (l.action || '').toLowerCase().includes(s)
      || (l.cible || '').toLowerCase().includes(s)
      || String(l.adminId || '').includes(s)
      || String(l.cibleId || '').includes(s),
    messageErreur: "Erreur lors du chargement des logs d'audit",
    taillePage: 15,
  });

  const filtrerParAction = (valeur) => {
    setActionFiltre(valeur);
    liste.setPage(1);
  };

  return { ...liste, actionFiltre, filtrerParAction };
}

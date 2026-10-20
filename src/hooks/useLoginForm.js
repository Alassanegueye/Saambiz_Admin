import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from '../utils/alert';
import { useAuth } from './useAuth';

const MAX_ATTEMPTS = 3;
const FREEZE_SECONDS = 30;

const HTTP_ERRORS = {
  400: 'Données de connexion invalides.',
  401: 'Email ou mot de passe incorrect.',
  403: 'Accès refusé.',
  404: 'Service introuvable.',
  429: 'Trop de tentatives. Réessayez plus tard.',
  500: 'Erreur serveur. Réessayez dans quelques instants.',
};

/**
 * Mécanique commune aux deux écrans de connexion (administration et espace
 * vendeur) : saisie, gel après trois échecs, traduction des erreurs HTTP.
 *
 * Les deux écrans restent deux pages distinctes — publics, discours et
 * destinations n'ont rien à voir — mais rien ne justifie de dupliquer ce
 * garde-fou, qui est une mesure de sécurité.
 *
 * @param onConnecte  reçoit l'utilisateur authentifié ; renvoie un message
 *                    d'erreur si son rôle n'a pas sa place sur cet écran,
 *                    sinon effectue la redirection et ne renvoie rien.
 */
export default function useLoginForm(onConnecte) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [frozen, setFrozen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const startFreeze = useCallback(() => {
    setFrozen(true);
    setCountdown(FREEZE_SECONDS);
    let restant = FREEZE_SECONDS;
    timerRef.current = setInterval(() => {
      restant -= 1;
      setCountdown(restant);
      if (restant <= 0) {
        clearInterval(timerRef.current);
        setFrozen(false);
        setAttempts(0);
        setCountdown(0);
      }
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (frozen) return;
    if (!email.trim()) { toast.error("L'email est requis"); return; }
    if (!password) { toast.error('Le mot de passe est requis'); return; }

    setLoading(true);
    try {
      const utilisateur = await login(email.trim(), password);
      const refus = onConnecte(utilisateur);
      if (refus) toast.error(refus);
    } catch (err) {
      const status = err?.response?.status;
      toast.error(HTTP_ERRORS[status] || 'Erreur de connexion.');
      const essais = attempts + 1;
      setAttempts(essais);
      if (essais >= MAX_ATTEMPTS) {
        toast.warning(`Trop de tentatives. Attente de ${FREEZE_SECONDS} secondes.`);
        startFreeze();
      }
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, loading, frozen, countdown, handleSubmit };
}

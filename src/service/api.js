import axios from 'axios';
import {
  getToken, setToken, removeToken,
  getRefreshToken, setRefreshToken,
  clearAuth, tokenExpire,
} from '../utils/storage';

/**
 * Module réseau unique de l'administration.
 *
 * Aucun composant n'importe axios : tout passe par cette instance, qui porte
 * l'adresse de l'API, le jeton, et la prolongation silencieuse de session.
 */
const api = axios.create({
  // Repli explicite : sans variable d'environnement, on vise le backend local.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/saambiz/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Prolongation silencieuse de session ────────────────────────────────────
//
// Le jeton d'accès vaut une heure. Sans ce mécanisme, l'application
// déconnectait sèchement au bout d'une heure, en pleine saisie d'un produit,
// alors que le backend émet un jeton de rafraîchissement prévu pour ça.
//
// Le point délicat : quand une page lance six requêtes en parallèle et que le
// jeton vient d'expirer, les six reçoivent un 401. Sans précaution, on
// déclenche six rafraîchissements concurrents — dont cinq échouent, puisque
// le backend fait tourner le jeton à chaque usage — et l'utilisateur est
// déconnecté malgré tout. On ne rafraîchit donc qu'une fois : la promesse
// partagée ci-dessous joue le rôle de file d'attente (tous les appelants
// attendent la même), sans tableau de rappels à vider à la main.
let rafraichissementEnCours = null;

function rafraichirUneSeuleFois() {
  if (!rafraichissementEnCours) {
    rafraichissementEnCours = rafraichirSession().finally(() => {
      rafraichissementEnCours = null;
    });
  }
  return rafraichissementEnCours;
}

const estRouteDAuth = (url = '') =>
  url.includes('/auth/refresh') || url.includes('/auth/login');

async function rafraichirSession() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('Aucun jeton de rafraîchissement');

  // Instance nue : passer par `api` relancerait l'intercepteur et, sur un
  // refresh refusé, boucler indéfiniment.
  const reponse = await axios.post(
    `${api.defaults.baseURL}/auth/refresh`,
    { refreshToken: refresh },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
  );

  const { token, refreshToken: nouveauRefresh } = reponse.data || {};
  if (!token) throw new Error('Réponse de rafraîchissement invalide');

  setToken(token);
  // Le backend fait tourner le refresh à chaque usage : ne pas enregistrer le
  // nouveau condamnerait la prolongation suivante.
  if (nouveauRefresh) setRefreshToken(nouveauRefresh);

  return token;
}

// ─── Envoi : jeton, et prolongation AVANT l'envoi si on le sait expiré ──────
//
// Standard SIGN : l'expiration est vérifiée côté client avant l'envoi. Sans
// ce contrôle, chaque requête partie avec un jeton périmé faisait un aller-
// retour pour rien (401), puis un refresh, puis un second envoi. Si le
// rafraîchissement anticipé échoue, on envoie quand même : le backend
// tranche, et l'intercepteur de réponse gère la déconnexion.
api.interceptors.request.use(async (config) => {
  if (!estRouteDAuth(config.url) && getRefreshToken() && tokenExpire()) {
    try {
      await rafraichirUneSeuleFois();
    } catch {
      // Laisser le 401 suivre le chemin normal ci-dessous.
    }
  }
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function deconnecter() {
  clearAuth();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

api.interceptors.response.use(
  (reponse) => reponse,
  async (erreur) => {
    const requete = erreur.config;
    const statut = erreur.response?.status;

    // On ne tente la prolongation que sur un 401, une seule fois par requête,
    // et jamais sur la route de rafraîchissement elle-même.
    const rejouable =
      statut === 401
      && requete
      && !requete._rejouee
      && !estRouteDAuth(requete.url);

    if (!rejouable) {
      if (statut === 401) deconnecter();
      return Promise.reject(erreur);
    }

    requete._rejouee = true;

    if (!getRefreshToken()) {
      deconnecter();
      return Promise.reject(erreur);
    }

    // Qu'un rafraîchissement soit déjà parti ou non, tout le monde attend
    // la même promesse.
    try {
      const token = await rafraichirUneSeuleFois();
      requete.headers.Authorization = `Bearer ${token}`;
      return api(requete);
    } catch {
      removeToken();
      deconnecter();
      return Promise.reject(erreur);
    }
  }
);

export default api;

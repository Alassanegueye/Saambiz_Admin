# SaamBiz — administration

Tableau de bord d'administration de la marketplace. React 18 + Vite, appelle
l'API SaamBiz en direct (sans proxy), et se déploie en fichiers statiques
servis par le Nginx du serveur.

API de référence : `https://api.saambiz.com/saambiz/v1`

## Démarrer en local

```bash
cp .env.example .env     # puis ajuster si besoin
npm install
npm run dev              # http://localhost:5188
```

Le port 5188 est imposé (`strictPort`) : c'est l'origine que le backend
déclare dans son `CORS_ORIGIN`. Un glissement sur 5189 redonnerait une erreur
réseau sans message.

Pour travailler en local contre l'API de production, avec les vrais comptes :

```bash
npm run dev:distant
```

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Vite sur le port 5188 |
| `npm run dev:distant` | Vite, branché sur l'API de production (`.env.distant`) |
| `npm run build` | produit `dist/` — c'est le déploiement |
| `npm run lint` | ESLint |
| `npm run preview` | sert `dist/` localement |

## Variables d'environnement

Trois fichiers, trois usages. Les variables `VITE_*` sont compilées dans le
bundle livré au navigateur : aucune n'est secrète, et c'est pourquoi deux de
ces fichiers sont versionnés.

| Fichier | Quand | Versionné |
|---|---|---|
| `.env.example` | modèle à recopier en `.env` | oui |
| `.env` | développement local | non |
| `.env.distant` | `npm run dev:distant` | oui |
| `.env.production` | `npm run build` | oui |

| Variable | Rôle |
|---|---|
| `VITE_API_BASE_URL` | adresse **absolue** de l'API, suffixe `/saambiz/v1` compris |
| `VITE_ESPACE_VENDEUR_URL` | lien vers l'espace vendeur |
| `VITE_SITE_URL` | site des boutiques — à garder identique à `VITRINE_BASE_URL` du backend |
| `VITE_DEMO` | à `1`, jeu de données local, aucune requête réseau |

L'administration et l'API vivent sur deux sous-domaines distincts, donc en
cross-origin : `VITE_API_BASE_URL` doit être une URL absolue, et le
`CORS_ORIGIN` du backend doit lister `https://admin.saambiz.com`.

## Déploiement

Pousser sur `main` suffit : `.github/workflows/deploy.yml` lance le lint et le
build, et ne déploie que si les deux passent. Le déploiement se connecte en
SSH au VPS, met le dépôt à jour, reconstruit, puis vérifie que le site répond
— accueil et route profonde.

Secrets à configurer une fois dans ce dépôt (Settings → Secrets and variables
→ Actions) :

| Secret | Valeur |
|---|---|
| `VPS_HOST` | adresse du serveur |
| `VPS_USER` | utilisateur SSH |
| `VPS_SSH_KEY` | clé privée SSH, la publique étant dans `~/.ssh/authorized_keys` du serveur |

### Première installation sur le serveur

Le workflow met à jour, il ne clone jamais : un premier passage à la main est
nécessaire.

```bash
mkdir -p /var/www/saambiz-admin
git clone https://github.com/Alassanegueye/Saambiz_Admin.git /var/www/saambiz-admin
cd /var/www/saambiz-admin
docker run --rm -v /var/www/saambiz-admin:/app -w /app node:22-slim \
  sh -c "npm ci --no-audit --no-fund && npm run build"
```

Le build tourne dans un conteneur jetable : le serveur n'a pas besoin de Node.

Puis Nginx, en deux temps — `deploy/nginx.conf` référence les certificats
Let's Encrypt, qui n'existent pas encore :

```bash
cp deploy/nginx-http.conf /etc/nginx/sites-available/saambiz-admin
sed -i "s/YOUR_DOMAIN/admin.saambiz.com/g" /etc/nginx/sites-available/saambiz-admin
ln -sf /etc/nginx/sites-available/saambiz-admin /etc/nginx/sites-enabled/saambiz-admin
nginx -t && systemctl reload nginx
certbot --nginx -d admin.saambiz.com
```

```bash
cp deploy/nginx.conf /etc/nginx/sites-available/saambiz-admin
sed -i "s/YOUR_DOMAIN/admin.saambiz.com/g" /etc/nginx/sites-available/saambiz-admin
nginx -t && systemctl reload nginx
```

`nginx -t` avant chaque `reload`, sans exception : Nginx est partagé, et un
seul fichier invalide empêche de recharger **tous** les sites de la machine.

Ce second bloc ne sert qu'à la première installation. Ensuite, le déploiement
repose `deploy/nginx.conf` à chaque poussée : il sauvegarde la version en
place, teste la nouvelle, et **restaure la précédente avant d'échouer** si
`nginx -t` ne passe pas. Une modification de la configuration suffit donc à
elle seule — il n'y a plus rien à recopier à la main.

### Mise à jour manuelle

```bash
cd /var/www/saambiz-admin && git pull && docker run --rm -v /var/www/saambiz-admin:/app -w /app node:22-slim sh -c "npm ci --no-audit --no-fund && npm run build"
```

Rien à redémarrer : Nginx sert `dist/` directement, les fichiers statiques
sont visibles immédiatement.

### Si une route profonde répond 404

`/login` ou `/vendeurs` renvoie 404 après un rechargement : le `try_files` de
la configuration Nginx n'est pas actif. C'est le seul réglage sans lequel une
application React Router paraît fonctionner — jusqu'au premier
rafraîchissement.

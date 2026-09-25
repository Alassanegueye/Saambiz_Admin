import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // 5188 est l'origine que le backend déclare dans CORS_ORIGIN. Ce port
  // n'était fixé nulle part : Vite retombait sur son défaut 5173, et
  // l'administration — la seule des trois interfaces à appeler l'API en
  // direct, sans proxy — se faisait refuser par CORS dès que NODE_ENV n'était
  // pas `development` (en développement, toute origine locale passe, ce qui
  // masquait le problème jusqu'à la recette).
  //
  // `strictPort` fait échouer le démarrage si 5188 est occupé, au lieu de
  // glisser sur 5189 : un glissement silencieux redonne exactement l'erreur
  // réseau sans message qu'on cherche à éviter.
  server: {
    port: 5188,
    strictPort: true,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor';
          }
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) {
            return 'router';
          }
          if (id.includes('node_modules/react-toastify')) {
            return 'toast';
          }
          if (id.includes('node_modules/axios')) {
            return 'http';
          }
        },
      },
    },
  },
})

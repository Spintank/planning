// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Vous pouvez définir ici des variables d'environnement par défaut
    // pour les tests, mais pour la production, utilisez .env.local ou
    // les variables d'environnement de Vercel
  }
};

module.exports = nextConfig;

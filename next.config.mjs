/** @type {import('next').NextConfig} */
const nextConfig = {
  // Les images sont servies par /api/images (stockées en base) : pas d'optimiseur distant nécessaire.
  images: { unoptimized: true },
};

export default nextConfig;

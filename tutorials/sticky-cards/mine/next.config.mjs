/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['ap-ds-storybook'],
  output: 'export',
  basePath: '/sticky-cards',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;

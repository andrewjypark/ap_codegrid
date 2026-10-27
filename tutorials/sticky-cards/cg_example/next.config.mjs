/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['ap-ds-storybook'],
  output: 'export',
  basePath: '/sticky-cards/cg_example',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;

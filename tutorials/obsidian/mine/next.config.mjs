/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['ap-ds-storybook'],
  output: 'export',
  basePath: '/obsidian',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;

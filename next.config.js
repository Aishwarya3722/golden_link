/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Capacitor wraps a static export of the web app for the mobile shell.
  // Comment this out (and use `next start`) when running the web-only build.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

import path from "node:path";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.resolve(process.cwd()),
  images: { unoptimized: true }
};

export default nextConfig;

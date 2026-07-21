import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NOTE: intentionally no `output: "standalone"` here — that setting is
  // only for self-hosting outside Vercel (e.g. our local Docker setup) and
  // was found to conflict with Vercel's own build/chunking pipeline,
  // causing a "ReactCurrentBatchConfig undefined" crash specifically in
  // the lazily-loaded 3D component chunk. Vercel manages its own optimized
  // output automatically and doesn't need this flag.
  // Ensures these packages are transpiled within the app's own module
  // graph rather than pre-bundled separately — this is what prevents
  // lazily-loaded 3D chunks from resolving a disconnected copy of React
  // at runtime (the root cause of a "ReactCurrentBatchConfig undefined"
  // crash seen in production with @react-three/fiber + next/dynamic).
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "@react-spring/three",
  ],
  webpack: (config) => {
    // Belt-and-suspenders: force every chunk, including dynamically
    // imported ones, to resolve to the exact same react/react-dom copy.
    config.resolve.alias = {
      ...config.resolve.alias,
      "react$": require.resolve("react"),
      "react-dom$": require.resolve("react-dom"),
    };
    return config;
  },
};

export default nextConfig;

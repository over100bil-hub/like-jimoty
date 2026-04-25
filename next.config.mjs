/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jjfddcngrewyxfycffrg.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Railway / Docker 互換
  output: "standalone",
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Exposing server variables to the client bundle
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_PROJECT_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_API_KEY,
  },
};

export default nextConfig;

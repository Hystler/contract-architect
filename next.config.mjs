/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/generate": ["./src/templates/*.docx"]
    }
  }
};

export default nextConfig;

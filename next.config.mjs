/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Default is 1mb, which most resume PDFs exceed. Client-side validation
      // already caps uploads well below this, this is just a server-side backstop.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDFKit uses dynamic require() for .afm font data files.
  // Next.js webpack bundling breaks these paths. Mark pdfkit as external
  // so Node.js resolves it at runtime instead of webpack bundling it.
  // Next.js 14 uses experimental.serverComponentsExternalPackages.
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"],
  },
};

export default nextConfig;

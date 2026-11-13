/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/admin/staged',
          destination: 'http://127.0.0.1:5000/admin/staged',
        },
        {
          source: '/admin/staged/:path*',
          destination: 'http://127.0.0.1:5000/admin/staged/:path*',
        },
        {
          source: '/admin',
          destination: 'http://127.0.0.1:5000/admin',
        },
        {
          source: '/admin/:path*',
          destination: 'http://127.0.0.1:5000/admin/:path*',
        },
        {
          source: '/preview',
          destination: 'http://127.0.0.1:5000/admin/staged',
        },
        {
          source: '/preview/:path*',
          destination: 'http://127.0.0.1:5000/admin/staged/:path*',
        },
        {
          source: '/css/:path*',
          destination: 'http://127.0.0.1:5000/css/:path*',
        },
        {
          source: '/js/:path*',
          destination: 'http://127.0.0.1:5000/js/:path*',
        },
        {
          source: '/uploads/:path*',
          destination: 'http://127.0.0.1:5000/uploads/:path*',
        },
      ],
      afterFiles: [
        {
          source: '/media/:path*',
          destination: '/:path*',
        },
      ],
      fallback: [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:5000/api/:path*',
        },
      ],
    };
  },
  images: {
    qualities: [75, 80, 85],
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

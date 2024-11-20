/** @type {import('next').NextConfig} */
import dotenv from 'dotenv';
dotenv.config();


const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    connect-src 'self' https://amrdb.idi.co.ug http://localhost:8000;
` 

const nextConfig = {
    async headers() {
        return [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'Content-Security-Policy',
                value: cspHeader.replace(/\n/g, ''),
              },
            ],
          },
        ]
      },
      env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      }
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost:3000',
    'localhost:3001',
    'localhost:3002',
    'localhost',
    '127.0.0.1:3000',
    '127.0.0.1:3001',
    '127.0.0.1:3002',
    '127.0.0.1',
    '192.168.1.41:3000',
    '192.168.1.41:3001',
    '192.168.1.41:3002',
    '192.168.1.41',
    '192.168.1.33:3000',
    '192.168.1.33:3001',
    '192.168.1.33:3002',
    '192.168.1.33',
    '192.168.*:*',
    '*.local:3000',
    '*.local:3001',
    '*.local:3002',
    '*.local',
  ],
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [100, 75],
  },
  // Add this block below to bridge your Netlify environment variables
  env: {
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    MONGO_URI: process.env.MONGO_URI,
  },
}

export default nextConfig

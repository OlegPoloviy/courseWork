/** @type {import('next').NextConfig} */
const nextConfig = {
  // Базові налаштування
  compress: true,
  poweredByHeader: false,
  // Відключаємо проблемні експериментальні функції
  experimental: {
    optimizeCss: false, // Відключаємо через проблему з critters
  },
};

module.exports = nextConfig;

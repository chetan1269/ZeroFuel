// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');
const { FileStore } = require('metro-cache');

const config = getDefaultConfig(__dirname);

// Use a stable on-disk store (shared across web/android)
const root = process.env.METRO_CACHE_ROOT || path.join(__dirname, '.metro-cache');
config.cacheStores = [
  new FileStore({ root: path.join(root, 'cache') }),
];

// Reduce the number of workers to decrease resource usage
config.maxWorkers = 2;

// Proxy /api requests to the Spring Boot backend running on localhost:8080.
// This lets the browser call relative /api/v1/... URLs through the Metro dev
// server, avoiding CORS and localhost-reachability issues in Replit's proxy.
config.server = config.server || {};
config.server.enhanceMiddleware = (metroMiddleware) => {
  const { createProxyMiddleware } = require('http-proxy-middleware');
  const apiProxy = createProxyMiddleware({
    target: 'http://localhost:8080',
    changeOrigin: true,
    logLevel: 'warn',
  });
  return (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return apiProxy(req, res, next);
    }
    return metroMiddleware(req, res, next);
  };
};

module.exports = config;

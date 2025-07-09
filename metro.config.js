const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package exports field for better ESM support
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
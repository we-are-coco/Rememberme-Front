const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  _expoRelativeProjectRoot: __dirname,
};

// noinspection JSCheckFunctionSignatures
module.exports = withNativeWind(config, { input: "./global.css" });

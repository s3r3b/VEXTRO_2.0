module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // REANIMATED v4 DOES NOT REQUIRE BABEL PLUGIN
    ],
  };
};

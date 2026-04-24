import config from "@iobroker/eslint-config";

export default [
  // Global ignores
  {
    ignores: ["node_modules/**", "test/**", "scripts/**"],
  },

  // Use official ioBroker ESLint config
  ...config,
];

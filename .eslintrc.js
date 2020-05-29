module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  plugins: ["@typescript-eslint", "import"],
  parserOptions: {
    ecmaFeatures: {
      modules: true,
    },
    ecmaVersion: 6, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",

    // The following rules are temporary. They are required to get linting started with Typescript and will be removed eventually
    "@typescript-eslint/no-explicit-any": 1,
    "@typescript-eslint/explicit-module-boundary-types": 2,
    "@typescript-eslint/no-unused-vars": 2,
    "@typescript-eslint/no-empty-function": 2,
  },
  overrides: [
    // Override some TypeScript rules just for .js files
    {
      files: ["*.js", "*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/no-var-requires": "off", //
      },
    },
  ],
}

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  plugins: ["@typescript-eslint", "import"],
  extends: ["airbnb-typescript/base"],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    "@typescript-eslint/no-var-requires": 0,
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    "no-param-reassign": ["error", { props: false }],
    "@typescript-eslint/quotes": "off",
    "quote-props": "off",
    "comma-dangle": "off",
    "@typescript-eslint/comma-dangle": "off",
    "no-underscore-dangle": [
      "error",
      {
        allow: [
          "_id",
          "_lottie_data",
          "_video_data",
          "_react_key",
          "_attribution",
          "_wizard",
        ],
      },
    ],
    "no-template-curly-in-string": 0,
    "no-console": 0, // must be on later
    "consistent-return": ["error", { treatUndefinedAsUnspecified: true }],
  },
};

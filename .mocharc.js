module.exports = {
  require: [
    "src/__tests__/resources/env.init.js", '@swc/register', "esm", "global-jsdom/register", 'ts-node/register/transpile-only', "ignore-styles", "src/__tests__/resources/mocha.init.ts"
  ],
  extension: ["js", "ts", "tsx"],
  package: './package.json',
  include: ["src/__tests__/*"],
  ignore: ["/node_modules/"],
}

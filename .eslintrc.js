module.exports = {
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: "module", // Allows for the use of imports
        ecmaFeatures: {
            jsx: true, // Allows for the parsing of JSX
        },
    },
    settings: {
        "mdx/code-blocks": true,
        // optional, if you want to disable language mapper, set it to `false`
        // if you want to override the default language mapper inside, you can provide your own
        "mdx/language-mapper": {},
        react: {
            version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
        },
        "json/sort-package-json": ["name", "version", "private", "scripts", "dependencies", "devDependencies"],
    },
    plugins: ["@typescript-eslint", "prettier", "json-format", "simple-import-sort", "unused-imports"],
    extends: [
        "eslint:recommended",
        "plugin:mdx/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    rules: {
        "sort-imports": "off",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
        "no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
        "@typescript-eslint/no-var-requires": "warn",
        "@typescript-eslint/no-empty-function": "warn",
        "@typescript-eslint/ban-types": "warn",
        "unused-imports/no-unused-vars": [
            "warn",
            { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
        ],
    },
    overrides: [
        {
            files: ["*.js"],
            rules: {
                "no-undef": "off",
            },
        },
    ],
};

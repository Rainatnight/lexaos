export default {
  defaultNamespace: "translation",
  // Default namespace used in your i18next config

  lexers: {
    tsx: ["JsxLexer"],
  },

  lineEnding: "auto",
  // Control the line ending. See options at https://github.com/ryanve/eol

  locales: ["ru", "en"],
  // An array of the locales in your applications

  keySeparator: false,

  namespaceSeparator: false,

  output: "public/locales/$LOCALE/$NAMESPACE.json",
  // Supports $LOCALE and $NAMESPACE injection
  // Supports JSON (.json) and YAML (.yml) file formats
  // Where to write the locale files relative to process.cwd()

  input: [
    "src/components/**/*.tsx",
    "src/pages/**/*.tsx",
    "src/shared/**/*.tsx",
    "src/pages/**/*.ts",
    "src/shared/**/*.ts",
  ],

  defaultValue: (locale: string, _namespace: string, key: string) => {
    if (locale === "ru") return key.match(/^(.*(?=::\w*)|.*(?!::\w*))/g)?.[0];
    return "";
  },
};

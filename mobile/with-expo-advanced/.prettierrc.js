module.exports = {
  // Line length - 80 is more readable on mobile devices and split screens
  printWidth: 80,

  // Indentation - 2 spaces is standard for JavaScript/React
  tabWidth: 2,
  useTabs: false,

  // Semicolons - Always use them to avoid ASI issues
  semi: true,

  // Quotes - Single quotes for JS/TS, double for JSX (React Native standard)
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,

  // Trailing commas - ES5 for better git diffs
  trailingComma: 'es5',

  // Brackets - Space inside brackets for readability
  bracketSpacing: true,
  bracketSameLine: false,

  // Arrow functions - Always use parentheses for consistency
  arrowParens: 'always',

  // File endings - LF for cross-platform compatibility
  endOfLine: 'lf',

  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',

  // Prose wrap
  proseWrap: 'preserve',

  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',

  // React Native specific
  // Ensures proper formatting for styled-components and style objects
  parser: 'typescript',

  // Override for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        parser: 'json',
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        parser: 'yaml',
      },
    },
  ],
};

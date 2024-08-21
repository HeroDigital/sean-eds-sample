const { generateIconComponents, generateSassIconsMap } = require('./src/icons');
const { generateThemeFile } = require('./src/theme');
const { formatFiles, lintStyles } = require('./src/cleanup');

(async () => {
  await Promise.allSettled([generateSassIconsMap(), generateThemeFile()]);
  formatFiles();
  lintStyles();
})();

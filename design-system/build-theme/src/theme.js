const { spawnSync } = require('child_process');
const { directories } = require('./constants');

/**
 * Generates the theme file
 */
function generateThemeFile() {
  const themeConfigFile = 'config.json';
  const themeSassPartial = '_theme.scss';

  console.log('🕒 Generating theme');

  spawnSync('npx', ['json-to-scss', `${directories.theme}/${themeConfigFile}`, `${directories.foundationalStyles}/${themeSassPartial}`], {
    stdio: 'inherit',
  });

  console.log('✅ Generated _theme.scss file');
}

module.exports = {
  generateThemeFile,
};

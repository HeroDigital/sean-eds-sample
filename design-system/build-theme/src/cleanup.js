const { spawnSync } = require('child_process');

/**
 * Formats all project files
 */
function formatFiles() {
  spawnSync('npx', ['prettier', '--write', './**/*.{js,jsx,ts,tsx,md,mdx,json,scss}', '--no-error-on-unmatched-pattern'], { stdio: 'inherit' });
  console.log('✅ Formatted files');
}

/**
 * Runs `stylelint` over all theme style files
 */
function lintStyles() {
  spawnSync('npx', ['stylelint', './**/*.scss', '--fix'], { stdio: 'inherit' });
  console.log('✅ Linted SCSS files');
}

module.exports = {
  formatFiles,
  lintStyles,
};

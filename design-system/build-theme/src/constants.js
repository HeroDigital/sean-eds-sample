const path = require('path');

const cwd = process.cwd();

const directories = Object.freeze({
  theme: path.join(cwd, 'design-system/theme'),
  foundationalStyles: path.join(cwd, 'design-system/styles/foundation'),
  iconsSrc: path.join(cwd, 'design-system/assets/icons'),
  iconsDir: path.join(cwd, 'design-system/theme/icons'),
});

module.exports = {
  cwd,
  directories,
};

const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const { transform } = require('@svgr/core');
const { spawnSync } = require('child_process');
const { directories } = require('./constants');

/** @type {import("@svgr/core").Config} */
const svgrDefaultConfig = {
  plugins: ['@svgr/plugin-svgo'],
  icon: true,
  svgo: true,
  svgoConfig: {
    multipass: true,
    plugins: ['preset-default', { name: 'sortAttrs' }, { name: 'removeDimensions' }],
  },
};

/**
 * Replaces hex colors with "currentColor"
 * @param {string} svgContent The SVG file content
 * @returns {string} The replaced SVG string
 */
function replaceHexColorsAndAttributes(svgContent) {
  // Match both 3 and 6 digits hex colors
  return svgContent.replace(/#[0-9A-Fa-f]{3,6}/g, 'currentColor');
}

/**
 * Removes all special characters from a file name and prepends "Icon" if needed.
 * @param {string} originalFileName The original file name
 * @returns {string} The parsed file name
 */
function parseFileName(originalFileName) {
  // Check if the string contains special characters
  const hasSpecialChars = /[^a-zA-Z0-9 ]/.test(originalFileName);
  // Remove special characters from the string
  const parsedFileName = originalFileName.replace(/[^a-zA-Z0-9 ]/g, '');

  // Prepend "Icon" if there were special characters at the beginning or it's just a number
  if (hasSpecialChars || /^[0-9]/.test(parsedFileName)) {
    return `Icon${parsedFileName}`;
  }

  return parsedFileName;
}

/**
 * Converts a string from pascal to kebab case
 * @param {string} string The target string
 * @returns {string} The converted string
 */
function toKebabCase(string) {
  // Replace spaces and underscores with hyphens
  const stringWithHyphens = string.replace(/[\s_]+/g, '-');
  // Convert camelCase to kebab-case
  const kebabCaseString = stringWithHyphens.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  // Remove any remaining non-alphanumeric characters
  return kebabCaseString.replace(/[^a-z0-9-]+/g, '');
}

/**
 * Gets the available collections names
 * @returns {Promise<Array<string>>} The collections names
 */
async function getCollections() {
  return (await fsPromises.readdir(directories.iconsSrc, { withFileTypes: true })).filter((dir) => dir.isDirectory()).map((dir) => dir.name);
}

/**
 * Generates the SASS icons map
 */
async function generateSassIconsMap() {
  console.log('🕒 Generating SASS icons map');

  const icons = {};
  const collections = await getCollections();

  // Optimize SVGs and create directories and files
  await Promise.all(
    collections.map(async (collection) => {
      const svgFolder = `${directories.iconsSrc}/${collection}`;

      const files = await fsPromises.readdir(svgFolder);

      await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(svgFolder, file);
          const fileName = path.parse(file).name;
          const isSvg = path.extname(filePath).toLowerCase() === '.svg';

          if (!isSvg) return;

          // Optimize and create icon file
          const svgCode = fs.readFileSync(filePath, 'utf8');

          if (!svgCode) return;

          const svgTransformed = await transform(replaceHexColorsAndAttributes(svgCode), {
            ...svgrDefaultConfig,
            svgoConfig: {
              ...svgrDefaultConfig.svgoConfig,
              datauri: 'base64',
            },
          });

          icons[toKebabCase(parseFileName(fileName))] = `"${svgTransformed}"`;
        }),
      );
    }),
  );

  const json = JSON.stringify(icons, undefined, 4);
  const jsonPath = `${directories.iconsDir}/icons.json`;
  const sassPartialName = '_icons.scss';

  await fsPromises.writeFile(jsonPath, json);
  spawnSync('npx', ['json-to-scss', jsonPath, `${directories.foundationalStyles}/${sassPartialName}`]);
  console.log(`✅ Created ${sassPartialName}`);
}

module.exports = {
  generateSassIconsMap,
};

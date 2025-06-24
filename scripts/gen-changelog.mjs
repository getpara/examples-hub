import { execSync } from 'child_process';
import fs from 'fs';
import * as glob from 'glob';

const CHANGELOG_FILE = './CHANGELOG.md';
const ALPHA_CHANGELOG_FILE = './ALPHA-CHANGELOG.md';
const COMMIT_TITLE = 'chore: publish';
let branch = 'main';

/**
 * Get all package versions in a monorepo
 * @param {string} packageDir - The directory containing package.json files (default: "packages/*")
 * @returns {Object} - Object containing package names and versions
 */
function getMonorepoPackageVersions(packageDir = 'packages/*') {
  const packageVersions = [];

  // Find all package.json files inside the monorepo structure
  const packageJsonPaths = glob.sync(`${packageDir}/package.json`);

  packageJsonPaths.forEach(filePath => {
    try {
      const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      packageVersions.push(`- ${packageJson.name}@${packageJson.version}`);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
    }
  });

  return packageVersions;
}

/**
 * Get the list of commits since last publish commit.
 * @returns {string[]} - List of commit messages between the two tags
 */
function getCommitsSinceLastPublish() {
  try {
    // Run the git log command to get the last commit with a specific message
    const lastPublishHash = execSync(`git log --grep="${COMMIT_TITLE}" --regexp-ignore-case -n 1 --pretty=format:"%h"`, {
      encoding: 'utf-8',
    })?.trim();

    if (!lastPublishHash) {
      console.error('No last publish commit found.');
      return [];
    }

    const result = execSync(`git log ${lastPublishHash}..${branch} --oneline --pretty=format:"%s - %h"`, {
      encoding: 'utf-8',
    })?.trim();

    // Split the result into an array of commit messages
    return result ? result.split('\n') : [];
  } catch (error) {
    console.error('Error fetching commits:', error.message);
    return [];
  }
}

function genChangelog() {
  const args = process.argv.slice(2);

  let isAlpha = false;

  if (args[0] !== '--branch') {
    throw new Error(`Invalid argument ${args[0]}`);
  }

  if (!args[1]) {
    throw new Error('Branch name is required');
  }

  if (args.includes('--alpha')) {
    isAlpha = true;
  }

  const filename = isAlpha ? ALPHA_CHANGELOG_FILE : CHANGELOG_FILE;
  branch = args[1];

  const commits = getCommitsSinceLastPublish();
  const cleanedCommits = commits.filter(commit => !commit.toLowerCase().includes(COMMIT_TITLE));

  let features, fixes, chores, docs, styles, refactors, performances, tests;

  for (const commit of cleanedCommits) {
    let [type, title] = commit.split(':');

    const cleanedTitle = title?.trim() || '';

    // If title starts with 'IGNORE', we skip this commit
    if (cleanedTitle.startsWith('IGNORE')) {
      continue;
    }

    if (type.includes('!')) {
      title = `**BREAKING CHANGE** ${cleanedTitle}`;
      type = type.slice(0, -1);
    }

    switch (type) {
      case 'feat': {
        if (!features) {
          features = '### Features\n';
        }
        features += `- ${cleanedTitle}\n`;
        break;
      }
      case 'fix': {
        if (!fixes) {
          fixes = '### Fixes\n';
        }
        fixes += `- ${cleanedTitle}\n`;
        break;
      }
      case 'chore': {
        if (!chores) {
          chores = '### Chores\n';
        }
        chores += `- ${cleanedTitle}\n`;
        break;
      }
      case 'docs': {
        if (!docs) {
          docs = '### Docs\n';
        }
        docs += `- ${cleanedTitle}\n`;
        break;
      }
      case 'style': {
        if (!styles) {
          styles = '### Styles\n';
        }
        styles += `- ${cleanedTitle}\n`;
        break;
      }
      case 'refactor': {
        if (!refactors) {
          refactors = '### Refactors\n';
        }
        refactors += `- ${cleanedTitle}\n`;
        break;
      }
      case 'perf': {
        if (!performances) {
          performances = '### Performance\n';
        }
        performances += `- ${cleanedTitle}\n`;
        break;
      }
      case 'test': {
        if (!tests) {
          tests = '### Tests\n';
        }
        tests += `- ${cleanedTitle}\n`;
        break;
      }
      default: {
        console.log(`Unknown commit type: ${type}, skipping.`);
      }
    }
  }

  const versions = getMonorepoPackageVersions();

  const stringToWrite = `
# Release (${new Date().toDateString()})

## Package Versions
${versions.join('\n')}

${features ?? ''}
${fixes ?? ''}
${chores ?? ''}
${docs ?? ''}
${styles ?? ''}
${refactors ?? ''}
${performances ?? ''}
${tests ?? ''}
`.trim('\n');

  try {
    // Read the existing content of the file
    const existingContent = fs.existsSync(filename) ? fs.readFileSync(filename, 'utf8') : '';

    // Combine new text with the existing content
    const newContent = stringToWrite + '\n\n' + existingContent;

    // Write the updated content back to the file
    fs.writeFileSync(filename, newContent, 'utf8');

    console.log('Changelog generated successfully!');
  } catch (error) {
    console.error('Error updating the file:', error);
  }
}

genChangelog();

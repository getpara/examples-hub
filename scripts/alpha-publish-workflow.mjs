#!/usr/bin/env node

/**
 * Alpha Publish Workflow Script
 *
 * This script automates the alpha publishing process for the web-sdk monorepo.
 *
 * Features:
 * - Dry run mode for testing without making changes
 * - STRICT npm version checking to prevent conflicts (fails if npm unreachable)
 * - Handles existing branches (local and remote)
 * - Skips version increment if already published
 * - Skips PR creation if PR already exists
 * - Handles cases with no changes to commit
 * - Gracefully handles missing GitHub CLI
 *
 * Environment Variables:
 * - DRYRUN=true               : Show what would happen without executing commands (read-only ops still run)
 * - SKIP_NPM_COMMANDS=true  : Skip yarn alpha-version and yarn alpha-publish commands
 * - SKIP_GH_COMMANDS=true   : Skip GitHub CLI commands (gh pr create)
 *
 * Requirements:
 * - Active npm access with proper authentication
 * - Internet connection for version checking
 * - Script will exit if npm is unreachable to prevent version conflicts
 *
 * Usage:
 *   yarn test-npm-connection                     # Test npm connectivity first
 *   yarn alpha-release                          # Normal execution
 *   DRYRUN=true yarn alpha-release              # Dry run mode (shows real git status, no changes made)
 *   SKIP_NPM_COMMANDS=true yarn alpha-release   # Skip npm commands
 *   SKIP_GH_COMMANDS=true yarn alpha-release    # Skip GitHub CLI commands
 *   SKIP_NPM_COMMANDS=true SKIP_GH_COMMANDS=true yarn alpha-release
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function getCurrentVersion() {
  try {
    // Read one of the package.json files to get current version
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'packages/react-sdk-lite/package.json'), 'utf8'));
    return packageJson.version;
  } catch (error) {
    console.error('Error reading current version:', error.message);
    process.exit(1);
  }
}

function getNextVersion(currentVersion) {
  // Extract the alpha number from version like "2.0.0-alpha.51"
  const match = currentVersion.match(/^(\d+\.\d+\.\d+)-alpha\.(\d+)$/);
  if (!match) {
    console.error('Invalid version format:', currentVersion);
    process.exit(1);
  }

  const [, baseVersion, alphaNumber] = match;
  const nextAlphaNumber = parseInt(alphaNumber) + 1;
  return `${baseVersion}-alpha.${nextAlphaNumber}`;
}

function runCommand(command, description, exitOnError = true, dryRun = false, readOnly = false, commandSummary = null) {
  console.log(`\n📋 ${description}`);

  if (dryRun && !readOnly) {
    console.log(`🔍 DRYRUN: ${command}`);
    console.log('🎭 Would execute this command (skipped in dry run mode)');
    if (commandSummary) {
      commandSummary.push({ command, description, type: 'modifying' });
    }
    return ''; // Return empty string in dry run mode
  }

  if (dryRun && readOnly) {
    console.log(`🔍 DRYRUN: ${command} (read-only, executing)`);
    if (commandSummary) {
      commandSummary.push({ command, description, type: 'read-only' });
    }
  }

  if (!dryRun && commandSummary) {
    commandSummary.push({ command, description, type: readOnly ? 'read-only' : 'modifying' });
  }

  try {
    if (!dryRun || readOnly) {
      console.log(`Running: ${command}`);
    }
    const result = execSync(command, {
      cwd: projectRoot,
      stdio: dryRun && readOnly ? 'pipe' : 'inherit', // Use pipe for read-only commands in dry run to avoid output spam
      encoding: 'utf8',
    });

    if (dryRun && readOnly) {
      console.log(`📊 Result: ${result.trim() || '(no output)'}`);
    }

    console.log('✅ Success');
    return result;
  } catch (error) {
    if (exitOnError) {
      console.error(`❌ Failed: ${description}`);
      console.error('Error:', error.message);
      process.exit(1);
    } else {
      throw error;
    }
  }
}

function isCommandAvailable(command) {
  try {
    execSync(`${command} --version`, {
      cwd: projectRoot,
      stdio: 'pipe', // Don't inherit stdio to avoid output
    });
    return true;
  } catch (error) {
    return false;
  }
}

function getLatestPublishedVersion(packageName) {
  try {
    // Check the latest published version on npm
    const result = execSync(`npm view ${packageName} version --json`, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    // npm view returns JSON, so parse it
    const version = JSON.parse(result.trim());
    return version;
  } catch (error) {
    console.error(`❌ CRITICAL: Could not fetch latest published version for ${packageName}`);
    console.error(`❌ Error: ${error.message}`);
    console.error(`❌ This script requires npm access to prevent version conflicts`);
    console.error(`❌ Please check your internet connection and npm authentication`);
    process.exit(1);
  }
}

function getLatestPublishedAlphaVersion(packageName) {
  try {
    // Get all alpha versions and find the latest one
    const result = execSync(`npm view ${packageName} versions --json`, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const versions = JSON.parse(result.trim());
    const alphaVersions = versions.filter(version => version.includes('-alpha.'));

    if (alphaVersions.length === 0) {
      console.error(`❌ CRITICAL: No alpha versions found for ${packageName}`);
      console.error(`❌ This suggests the package may not be published yet or npm access is restricted`);
      console.error(`❌ Please check your npm authentication and package publishing permissions`);
      process.exit(1);
    }

    // Sort alpha versions and get the latest
    const sortedAlphaVersions = alphaVersions.sort((a, b) => {
      const aMatch = a.match(/-alpha\.(\d+)$/);
      const bMatch = b.match(/-alpha\.(\d+)$/);

      if (aMatch && bMatch) {
        return parseInt(bMatch[1]) - parseInt(aMatch[1]);
      }
      return 0;
    });

    return sortedAlphaVersions[0];
  } catch (error) {
    console.error(`❌ CRITICAL: Could not fetch alpha versions for ${packageName}`);
    console.error(`❌ Error: ${error.message}`);
    console.error(`❌ This script requires npm access to prevent version conflicts`);
    console.error(`❌ Please check your internet connection and npm authentication`);
    process.exit(1);
  }
}

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', {
      cwd: projectRoot,
      encoding: 'utf8',
    }).trim();
  } catch (error) {
    console.log('⚠️  Could not determine current branch');
    return null;
  }
}

function branchExists(branchName) {
  try {
    execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, {
      cwd: projectRoot,
    });
    return true;
  } catch (error) {
    return false;
  }
}

function remoteBranchExists(branchName) {
  try {
    execSync(`git ls-remote --heads origin ${branchName}`, {
      cwd: projectRoot,
    });
    return true;
  } catch (error) {
    return false;
  }
}

function prExists(branchName) {
  if (!isCommandAvailable('gh')) {
    return false; // Can't check if gh is not available
  }

  try {
    const result = execSync(`gh pr list --head ${branchName} --json number --jq 'length'`, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    }).trim();

    return parseInt(result) > 0;
  } catch (error) {
    return false;
  }
}

async function main() {
  // Check for flags
  const dryRun = process.env.DRYRUN === 'true';
  const skipNpm = process.env.SKIP_NPM_COMMANDS === 'true';
  const skipGh = process.env.SKIP_GH_COMMANDS === 'true';

  // Track commands for dry run summary
  const commandSummary = [];

  console.log('🚀 Starting alpha publish workflow...\n');

  if (dryRun) {
    console.log('🎭 DRYRUN=true - Running in dry run mode');
    console.log('🔍 This will show you what the script would do without making changes');
    console.log('📊 Read-only operations (like git diff/status) will actually execute to show real state');

    // Show current git status in dry run mode
    try {
      console.log('\n📋 Current repository status:');
      const statusResult = execSync('git status --porcelain', {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      if (statusResult.trim()) {
        console.log(statusResult.trim());
      } else {
        console.log('✅ Working directory is clean');
      }
    } catch (error) {
      console.log('⚠️  Could not check git status');
    }
  }

  if (skipNpm) {
    console.log('⚠️  SKIP_NPM_COMMANDS=true - Skipping yarn alpha-version and yarn alpha-publish commands');
  }

  if (skipGh) {
    console.log('⚠️  SKIP_GH_COMMANDS=true - Skipping GitHub CLI commands');
  }

  // Step 1: Get current and next versions based on published npm version
  console.log('🔍 Checking npm for latest published alpha version...');

  const localVersion = getCurrentVersion();
  console.log(`📁 Local version: ${localVersion}`);

  // CRITICAL: Get the latest published alpha version (will exit if npm is unreachable)
  const publishedAlphaVersion = getLatestPublishedAlphaVersion('@getpara/react-sdk-lite');
  console.log(`📦 Latest published alpha version: ${publishedAlphaVersion}`);

  // Check if local version differs from published version
  if (localVersion !== publishedAlphaVersion) {
    console.log(`⚠️  Local version (${localVersion}) differs from published version (${publishedAlphaVersion})`);
    console.log('ℹ️  This is normal - will increment from published version to avoid conflicts');
  }

  const nextVersion = getNextVersion(publishedAlphaVersion);
  console.log(`🎯 Next version to publish: ${nextVersion}`);
  console.log(`📋 Will increment: ${publishedAlphaVersion} → ${nextVersion}`);

  // Step 2: Check current branch and handle contingencies
  const currentBranch = getCurrentBranch();
  const branchName = `publish-${nextVersion}`;

  console.log(`Current branch: ${currentBranch || 'unknown'}`);
  console.log(`Target branch: ${branchName}`);

  // Handle case where we're already on the target branch
  if (currentBranch === branchName) {
    console.log('✅ Already on target branch, skipping checkout and branch creation');
  } else {
    // Step 2: Checkout 2.0.0-alpha branch (only if not already on it)
    if (currentBranch !== '2.0.0-alpha') {
      runCommand('git checkout 2.0.0-alpha', 'Checking out 2.0.0-alpha branch', true, dryRun, false, commandSummary);
    } else {
      console.log('✅ Already on 2.0.0-alpha branch');
    }

    // Step 3: Pull latest changes
    runCommand(
      'git pull origin 2.0.0-alpha',
      'Pulling latest changes from 2.0.0-alpha',
      true,
      dryRun,
      false,
      commandSummary,
    );

    // Step 4: Create new branch (handle if it already exists)
    if (branchExists(branchName)) {
      console.log(`⚠️  Branch ${branchName} already exists locally, switching to it`);
      runCommand(
        `git checkout ${branchName}`,
        `Switching to existing branch: ${branchName}`,
        true,
        dryRun,
        false,
        commandSummary,
      );
    } else if (remoteBranchExists(branchName)) {
      console.log(`⚠️  Branch ${branchName} exists remotely, checking it out`);
      runCommand(
        `git checkout ${branchName}`,
        `Checking out existing remote branch: ${branchName}`,
        true,
        dryRun,
        false,
        commandSummary,
      );
    } else {
      runCommand(`git checkout -b ${branchName}`, `Creating new branch: ${branchName}`, true, dryRun, false, commandSummary);
    }
  }

  // Step 5: Prepare for version increment
  if (!skipNpm) {
    console.log('🔧 Preparing for version increment...');

    // Reset Nx cache to ensure clean state
    runCommand('yarn nx reset', 'Resetting Nx cache for clean build state', true, dryRun, false, commandSummary);

    // Build all packages to ensure they're up-to-date
    runCommand('yarn build', 'Building all packages before version increment', true, dryRun, false, commandSummary);

    // Check if the LOCAL version is already at the next version (increment already done)
    if (localVersion === nextVersion) {
      console.log(`⚠️  Local version is already ${nextVersion}, skipping yarn alpha-version`);
      console.log(`📁 Local: ${localVersion} | 📦 Published: ${publishedAlphaVersion} | 🎯 Next: ${nextVersion}`);
      console.log('ℹ️  Version increment has already been completed');
    } else {
      console.log(`🔄 Will increment version: ${localVersion} → ${nextVersion}`);
      runCommand(
        'yarn alpha-version',
        'Running yarn alpha-version to increment version',
        true,
        dryRun,
        false,
        commandSummary,
      );
    }
  } else {
    console.log('\n⚠️  Skipping yarn alpha-version (SKIP_NPM_COMMANDS=true)');
  }

  // Step 6: Stage and commit all changes (using git commit -a)
  if (!dryRun) {
    try {
      // Check if there are any changes to commit (staged or unstaged files)
      execSync('git diff --cached --quiet && git diff --quiet', { cwd: projectRoot });
      console.log('⚠️  No changes to commit (version may already be incremented)');
    } catch (error) {
      // There are changes to commit - use git commit -a to stage and commit all changes
      runCommand(
        `git commit -a -m "chore: bump version to ${nextVersion}"`,
        `Staging and committing all changes`,
        true,
        false,
        false,
        commandSummary,
      );
    }
  } else {
    // In dry run mode, check for changes and simulate the commit -a
    try {
      execSync('git diff --cached --quiet && git diff --quiet', { cwd: projectRoot });
      console.log('⚠️  No changes to commit (version may already be incremented)');
    } catch (error) {
      console.log('📝 There are changes that would be staged and committed');
      runCommand(
        `git commit -a -m "chore: bump version to ${nextVersion}"`,
        `Staging and committing all changes`,
        true,
        true,
        false,
        commandSummary,
      );
    }
  }

  // Step 7: Push the branch (check if there are commits to push)
  try {
    // Check if there are commits to push (read-only operation, execute even in dry run)
    const aheadCount = execSync(`git rev-list HEAD...origin/${branchName} --count 2>/dev/null || echo "0"`, {
      cwd: projectRoot,
      encoding: 'utf8',
    }).trim();

    if (dryRun) {
      console.log(`📊 Commits to push: ${aheadCount}`);
    }

    if (aheadCount === '0') {
      console.log(`⚠️  No commits to push on branch ${branchName}`);
    } else {
      runCommand(`git push origin ${branchName}`, `Pushing branch ${branchName}`, true, dryRun, false, commandSummary);
    }
  } catch (error) {
    if (dryRun) {
      console.log('📊 Could not check commits to push (remote branch may not exist)');
    }
    // If the remote branch doesn't exist yet, try to push and set upstream
    try {
      runCommand(
        `git push -u origin ${branchName}`,
        `Pushing branch ${branchName} and setting upstream`,
        true,
        dryRun,
        false,
        commandSummary,
      );
    } catch (pushError) {
      console.log(`⚠️  Could not push branch ${branchName}:`, pushError.message);
    }
  }

  // Step 8: Create PR (using GitHub CLI if available)
  const prBody = `Please go through the checklist if you are the PR author or reviewer and ensure that every item is satisfied.

## Pull Request Checklist
This pull request should adhere to the guidelines described here https://www.notion.so/capsule-org/Pull-Request-Guidelines-1bcb3bc281648041bfa2c469e6098ff9
- [x] This PR does not depend on new backend changes and if it does, this PR will not be merged until the backend changes are deployed to production. Also, the relevant backend PR is linked in the description/comments.
- [x] A new NPM release with this PR will not break an existing integration for a partner or cause a degraded experience if an existing integration bumps to the new version without making any other code change. If a breaking change is needed, discuss with the rest of the team first on a plan and use a major version bump.
- [x] If this PR requires docs changes, a PR for the docs repo is ready to be merged after this PR is. Also, the relevant docs PR is linked in the description/comments.
- [x] All the packages in this repo can be successfully built and the legacy-example still works with the changes in this PR.
- [x] Running \`yarn start\` executes successfully and results in no runtime errors.
- [x] Running \`yarn start-bridge\` executes successfully and results in no runtime errors.

NO DOCS NEEDED
NO EXAMPLES NEEDED`;

  // Create truncated version for command summary
  const prBodyTruncated = prBody.length > 100 ? prBody.substring(0, 100) + '...' : prBody;

  if (isCommandAvailable('gh') && !skipGh) {
    // Check if PR already exists
    if (prExists(branchName)) {
      console.log(`⚠️  PR already exists for branch ${branchName}, skipping PR creation`);
    } else {
      try {
        // For command summary, show truncated version but use full body in actual command
        const summaryCommand = `gh pr create --title "chore: Publish" --body "${prBodyTruncated.replace(/"/g, '\\"')}..." --base 2.0.0-alpha`;
        const actualCommand = `gh pr create --title "chore: Publish" --body "${prBody.replace(/"/g, '\\"')}" --base 2.0.0-alpha`;

        runCommand(
          actualCommand,
          `Creating PR with GitHub CLI (${prBody.length} chars)`,
          false, // Don't exit on error
          dryRun,
          false,
          commandSummary,
        );

        // Override the command in summary to show truncated version
        if (commandSummary && commandSummary.length > 0) {
          const lastCommand = commandSummary[commandSummary.length - 1];
          if (lastCommand.description.includes('Creating PR')) {
            lastCommand.command = summaryCommand;
          }
        }
      } catch (error) {
        console.log('\n⚠️  GitHub CLI failed to create PR automatically.');
        console.log(`Please create a PR manually:`);
        console.log(`- Title: chore: Publish`);
        console.log(`- Base branch: 2.0.0-alpha`);
        console.log(`- Head branch: ${branchName}`);
      }
    }
  } else {
    if (skipGh) {
      console.log('\n⚠️  Skipping GitHub CLI commands (SKIP_GH_COMMANDS=true).');
    } else {
      console.log('\n⚠️  GitHub CLI not available.');
    }
    console.log(`Please create a PR manually:`);
    console.log(`- Title: chore: Publish`);
    console.log(`- Base branch: 2.0.0-alpha`);
    console.log(`- Head branch: ${branchName}`);
  }

  // Step 9: Run yarn alpha-publish
  if (!skipNpm) {
    runCommand('yarn alpha-publish', 'Running yarn alpha-publish to publish packages', true, dryRun, false, commandSummary);
  } else {
    console.log('\n⚠️  Skipping yarn alpha-publish (SKIP_NPM_COMMANDS=true)');
  }

  if (dryRun) {
    console.log('\n🎭 Dry run completed successfully!');
    console.log(`📦 Would publish version: ${nextVersion} (from ${publishedAlphaVersion})`);
    console.log(`🌿 Would create/use branch: ${branchName}`);
    console.log('💡 No actual changes were made - this was a dry run');

    // Display command summary
    console.log('\n📋 COMMAND SUMMARY:');
    console.log('='.repeat(60));

    if (commandSummary.length === 0) {
      console.log('ℹ️  No commands were executed (all operations skipped)');
    } else {
      commandSummary.forEach((cmd, index) => {
        const icon = cmd.type === 'read-only' ? '👁️' : '⚡';
        console.log(`${index + 1}. ${icon} ${cmd.description}`);
        console.log(`   ${cmd.command}`);
        console.log('');
      });
    }

    console.log('='.repeat(60));
    console.log(`📊 Total commands: ${commandSummary.length}`);
    console.log(`👁️  Read-only: ${commandSummary.filter(c => c.type === 'read-only').length}`);
    console.log(`⚡ Modifying: ${commandSummary.filter(c => c.type === 'modifying').length}`);
  } else {
    console.log('\n🎉 Alpha publish workflow completed successfully!');
    console.log(`📦 Published version: ${nextVersion} (from ${publishedAlphaVersion})`);
    console.log(`🌿 Branch: ${branchName}`);
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { main as alphaPublishWorkflow };

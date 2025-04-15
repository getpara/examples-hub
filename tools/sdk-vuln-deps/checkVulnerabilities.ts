#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import path from 'path';

interface Advisory {
  data: {
    advisory: {
      severity: string;
    };
  };
  type: string;
}

interface VulnerabilityCount {
  high: number;
  critical: number;
}

function getVulnerabilityCounts(auditOutput: string | undefined): VulnerabilityCount {
  if (!auditOutput) {
    throw new Error('No audit output received. The yarn audit command may have failed.');
  }

  const auditLines = auditOutput.trim().split('\n');
  const auditResults: Advisory[] = [];

  for (const line of auditLines) {
    try {
      const json = JSON.parse(line);
      if (json.type === 'auditAdvisory') {
        auditResults.push(json);
      }
    } catch (error) {
      console.log('Skipping line:', line);
      console.log('Error:', error);
      continue;
    }
  }

  const highVulnerabilities = auditResults.filter(result => result.data.advisory.severity === 'high').length;
  const criticalVulnerabilities = auditResults.filter(result => result.data.advisory.severity === 'critical').length;

  return {
    high: highVulnerabilities,
    critical: criticalVulnerabilities,
  };
}

async function getVulnerabilities(branchName: string): Promise<VulnerabilityCount> {
  console.log(`Checking vulnerabilities for ${branchName}...`);

  try {
    console.log(`Installing dependencies for ${branchName}...`);
    execSync('yarn install --force', {
      cwd: path.resolve(__dirname),
      stdio: 'inherit',
    });

    console.log(`Running audit for ${branchName}...`);
    let auditOutput: string;

    try {
      auditOutput = execSync('yarn audit --json', {
        cwd: path.resolve(__dirname),
        encoding: 'utf-8',
      });
    } catch (auditError: any) {
      // Yarn audit returns exit code 1 when it finds vulnerabilities
      // We still want to process the output
      if (!auditError.stdout || auditError.stdout.trim() === '') {
        throw new Error(`Yarn audit failed with no output for ${branchName} branch`);
      }
      auditOutput = auditError.stdout;
    }

    return getVulnerabilityCounts(auditOutput);
  } catch (error: any) {
    console.error(`Error getting vulnerabilities for ${branchName}:`, error.message);
    throw error;
  }
}

async function main(): Promise<void> {
  const isPR = process.env.GITHUB_EVENT_NAME === 'pull_request';
  const isGithubAction = !!process.env.GITHUB_ACTIONS;

  try {
    if (!isGithubAction) {
      console.log('Not running in GitHub Actions, will check current branch only');
      const vulns = await getVulnerabilities('current branch');
      console.log(`Found vulnerabilities: High: ${vulns.high}, Critical: ${vulns.critical}`);
      process.exit(0);
    }

    if (!isPR) {
      console.log('Not a PR, skipping comparison with main branch');
      const vulns = await getVulnerabilities('current branch');
      console.log(`Found vulnerabilities: High: ${vulns.high}, Critical: ${vulns.critical}`);
      process.exit(0);
    }

    console.log('PR detected, will compare vulnerabilities with main branch');

    let currentVulns: VulnerabilityCount;
    try {
      currentVulns = await getVulnerabilities('current branch');
      console.log(`Current branch vulnerabilities: High: ${currentVulns.high}, Critical: ${currentVulns.critical}`);
    } catch (error: any) {
      console.error('Failed to check current branch vulnerabilities:', error.message);
      process.exit(1);
    }

    console.log('Checking out main branch to compare vulnerabilities...');
    execSync('git fetch origin main:main', { stdio: 'inherit' });
    execSync('git checkout main -- ../../packages', { stdio: 'inherit' });

    try {
      execSync('rm -f yarn.lock', {
        cwd: path.resolve(__dirname),
        stdio: 'inherit',
      });
    } catch (error) {
      console.warn('Warning: Failed to remove yarn.lock file:', error);
    }

    let mainVulns: VulnerabilityCount;
    try {
      mainVulns = await getVulnerabilities('main branch');
      console.log(`Main branch vulnerabilities: High: ${mainVulns.high}, Critical: ${mainVulns.critical}`);
    } catch (error: any) {
      console.error('Failed to check main branch vulnerabilities:', error.message);
      process.exit(1);
    }

    const hasMoreHighVulns = currentVulns.high > mainVulns.high;
    const hasMoreCriticalVulns = currentVulns.critical > mainVulns.critical;

    if (hasMoreHighVulns) {
      console.error(`❌ High vulnerabilities increased: main (${mainVulns.high}) → current (${currentVulns.high})`);
    }

    if (hasMoreCriticalVulns) {
      console.error(
        `❌ Critical vulnerabilities increased: main (${mainVulns.critical}) → current (${currentVulns.critical})`,
      );
    }

    if (hasMoreHighVulns || hasMoreCriticalVulns) {
      console.error(`To override this check, add the comment 'INCREASED VULNERABILITIES ACCEPTED' to your PR description.`);
      process.exit(1);
    }

    console.log('✅ Vulnerability check passed! No increase in high or critical vulnerabilities compared to main branch.');
    process.exit(0);
  } catch (error: any) {
    console.error('Error during vulnerability comparison process:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

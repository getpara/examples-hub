#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../helpers/logger';

const playwrightLogger = logger.withContext('Playwright Setup');

function getPlaywrightPath(): string {
  return join(process.cwd(), 'node_modules', '@playwright', 'test');
}

function isBrowserInstalled(): boolean {
  const playwrightPath = getPlaywrightPath();
  
  try {
    // Check if Playwright is installed
    if (!existsSync(playwrightPath)) {
      playwrightLogger.logDebug('Playwright not found in node_modules');
      return false;
    }

    // Check for chromium browser directory
    const browsersPath = join(playwrightPath, '..', '..', '.cache', 'ms-playwright');
    if (!existsSync(browsersPath)) {
      playwrightLogger.logDebug('Playwright cache directory not found');
      return false;
    }

    // Look for chromium installation
    const entries = readdirSync(browsersPath);
    const hasChromium = entries.some(entry => entry.startsWith('chromium-'));
    
    if (!hasChromium) {
      playwrightLogger.logDebug('Chromium browser not found in cache');
      return false;
    }

    playwrightLogger.logDebug('Chromium browser found in cache');
    return true;
  } catch (error) {
    playwrightLogger.logDebug(`Error checking browser installation: ${error}`);
    return false;
  }
}

function installBrowsers(): void {
  playwrightLogger.logInfo('Installing Playwright browsers...');
  
  try {
    execSync('npx playwright install chromium', { 
      stdio: 'inherit',
      env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0' }
    });
    playwrightLogger.logStep('Playwright browsers installed successfully', true);
  } catch (error) {
    playwrightLogger.logError('Failed to install Playwright browsers', error);
    process.exit(1);
  }
}

export function ensurePlaywrightBrowsers(): void {
  playwrightLogger.logInfo('Checking Playwright browser installation...');
  
  if (!isBrowserInstalled()) {
    playwrightLogger.logWarning('Playwright browsers not found');
    installBrowsers();
  } else {
    playwrightLogger.logStep('Playwright browsers already installed', true);
  }
}

// Run if called directly
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  ensurePlaywrightBrowsers();
}

export { isBrowserInstalled };
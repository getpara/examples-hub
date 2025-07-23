import { execSync, ExecSyncOptions } from 'child_process';
import fs from 'fs';
import path from 'path';
import { 
  QueueItem, 
  RetryOptions, 
  PackageJson,
  CleanOptions,
  PackageManager 
} from './types';
import { 
  SKIP_DIRS, 
  MAX_TRAVERSAL_DEPTH
} from './constants';

export class ConcurrencyLimiter {
  private limit: number;
  private running: number = 0;
  private queue: QueueItem<unknown>[] = [];

  constructor(limit: number) {
    this.limit = limit;
  }

  async run<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ 
        task: task as () => Promise<unknown>, 
        resolve: resolve as (value: unknown) => void, 
        reject 
      });
      this.process();
    });
  }

  async process(): Promise<void> {
    if (this.running >= this.limit || this.queue.length === 0) {
      return;
    }

    this.running++;
    const queueItem = this.queue.shift();
    if (!queueItem) return;
    const { task, resolve, reject } = queueItem;

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

export function findProjectDirectories(baseDir: string): string[] {
  const projectDirs = new Set<string>();
  
  function traverse(dir: string, depth = 0): void {
    if (depth > MAX_TRAVERSAL_DEPTH) return;
    
    const dirName = path.basename(dir);
    if (SKIP_DIRS.includes(dirName)) return;
    
    try {
      const items = fs.readdirSync(dir);
      
      if (items.includes('package.json')) {
        projectDirs.add(dir);
      }
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            traverse(fullPath, depth + 1);
          }
        } catch (err) {
          // Skip inaccessible directories
        }
      }
    } catch (err) {
      // Skip inaccessible directories
    }
  }
  
  traverse(baseDir);
  return Array.from(projectDirs).sort();
}

export function hasScript(dir: string, scriptName: string): boolean {
  try {
    const packageJsonPath = path.join(dir, 'package.json');
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return Boolean(packageJson.scripts && packageJson.scripts[scriptName]);
  } catch (err) {
    return false;
  }
}

export function detectPackageManager(dir: string): PackageManager {
  if (dir.includes('server/with-bun')) {
    return 'bun';
  } else if (dir.includes('server/with-deno')) {
    return 'deno';
  }
  return 'yarn';
}

export async function retryWithBackoff<T>(
  fn: () => T | Promise<T>,
  options: RetryOptions
): Promise<{ success: boolean; result?: T; error?: string }> {
  const { maxRetries, baseDelay } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return { success: true, result };
    } catch (error) {
      if (attempt === maxRetries) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage.split('\n')[0] };
      }
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt - 1)));
    }
  }
  return { success: false, error: 'Max retries exceeded' };
}

export function executeCommand(
  command: string, 
  options: ExecSyncOptions & { throwOnError?: boolean }
): { success: boolean; output?: string; error?: string } {
  const { throwOnError = true, ...execOptions } = options;
  
  try {
    const output = execSync(command, { 
      ...execOptions, 
      encoding: 'utf8',
      stdio: execOptions.stdio || 'pipe' 
    });
    return { success: true, output };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (throwOnError) {
      throw error;
    }
    return { success: false, error: errorMessage };
  }
}

export async function cleanDirectory(dir: string, patterns: string[], dryRun: boolean): Promise<number> {
  let cleanedCount = 0;
  
  for (const pattern of patterns) {
    const targetPath = path.join(dir, pattern);
    
    try {
      if (fs.existsSync(targetPath)) {
        const stat = fs.statSync(targetPath);
        if (stat.isDirectory() || stat.isFile()) {
          if (dryRun) {
            console.log(`  [DRY RUN] Would remove: ${targetPath}`);
          } else {
            if (stat.isDirectory()) {
              fs.rmSync(targetPath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(targetPath);
            }
            console.log(`  ✓ Removed: ${targetPath}`);
          }
          cleanedCount++;
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Failed to remove ${targetPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return cleanedCount;
}

export async function cleanProjects(options: CleanOptions): Promise<void> {
  const { baseDir, patterns, dryRun } = options;
  const startTime = Date.now();
  
  console.log(`🧹 Cleaning ${baseDir} projects${dryRun ? ' (DRY RUN)' : ''}...`);
  console.log('============================================================');
  
  const fullBaseDir = path.join(process.cwd(), baseDir);
  if (!fs.existsSync(fullBaseDir)) {
    console.error(`❌ Directory not found: ${fullBaseDir}`);
    process.exit(1);
  }
  
  const projectDirs = findProjectDirectories(fullBaseDir);
  let totalCleaned = 0;
  
  for (const projectDir of projectDirs) {
    console.log(`\n📁 Cleaning: ${projectDir}`);
    const cleanedInProject = await cleanDirectory(projectDir, patterns, dryRun);
    totalCleaned += cleanedInProject;
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n============================================================');
  console.log('📊 Clean Summary:');
  console.log(`   Projects processed: ${projectDirs.length}`);
  console.log(`   Items ${dryRun ? 'would be' : ''} removed: ${totalCleaned}`);
  console.log(`   Duration: ${duration}s`);
  console.log('============================================================');
  console.log(`${dryRun ? '🔍 Dry run complete!' : '🎉 Clean complete!'}`);
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}
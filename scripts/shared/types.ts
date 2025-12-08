export interface TaskResult {
  dir: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

export interface InstallResult extends TaskResult {
  packageManager: 'yarn' | 'bun' | 'deno';
  wasRetry?: boolean;
  reason?: string;
}

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
}

export interface CleanOptions {
  baseDir: string;
  patterns: string[];
  dryRun: boolean;
}

export interface ProjectScript {
  name: string;
  timeout: number;
}

export interface QueueItem<T> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

export type PackageManager = 'yarn' | 'bun' | 'deno';

export interface PackageJson {
  scripts?: Record<string, string>;
  name?: string;
  version?: string;
}
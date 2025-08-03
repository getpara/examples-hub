/**
 * Universal logging helper for e2e tests
 * Provides consistent logging format across all test files
 */

export class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  /**
   * Log a step in the test execution
   * @param message - The message to log
   * @param isSuccess - Whether this is a success message (default: false)
   */
  logStep(message: string, isSuccess: boolean = false): void {
    const prefix = isSuccess ? '✅' : '🔄';
    const contextPrefix = this.context ? `[${this.context}] ` : '';
    console.log(`${prefix} ${contextPrefix}${message}`);
  }

  /**
   * Log an error
   * @param message - The error message
   * @param error - The error object (optional)
   */
  logError(message: string, error?: any): void {
    const contextPrefix = this.context ? `[${this.context}] ` : '';
    console.error(`❌ ${contextPrefix}${message}`, error?.message || error || '');
  }

  /**
   * Log an informational message
   * @param message - The message to log
   */
  logInfo(message: string): void {
    const contextPrefix = this.context ? `[${this.context}] ` : '';
    console.log(`ℹ️ ${contextPrefix}${message}`);
  }

  /**
   * Log a warning message
   * @param message - The message to log
   */
  logWarning(message: string): void {
    const contextPrefix = this.context ? `[${this.context}] ` : '';
    console.log(`⚠️ ${contextPrefix}${message}`);
  }

  /**
   * Log a debug message (only in non-CI environments)
   * @param message - The message to log
   */
  logDebug(message: string): void {
    if (!process.env.CI) {
      const contextPrefix = this.context ? `[${this.context}] ` : '';
      console.log(`🔍 ${contextPrefix}${message}`);
    }
  }

  /**
   * Log with a custom emoji prefix
   * @param emoji - The emoji to use as prefix
   * @param message - The message to log
   */
  log(emoji: string, message: string): void {
    const contextPrefix = this.context ? `[${this.context}] ` : '';
    console.log(`${emoji} ${contextPrefix}${message}`);
  }

  /**
   * Log a waiting/pause message
   * @param message - The message to log
   */
  logWait(message: string): void {
    const contextPrefix = this.context ? `[${this.context}] ` : '';
    console.log(`⏳ ${contextPrefix}${message}`);
  }

  /**
   * Create a child logger with additional context
   * @param additionalContext - Additional context to append
   */
  withContext(additionalContext: string): Logger {
    const newContext = this.context ? `${this.context} > ${additionalContext}` : additionalContext;
    return new Logger(newContext);
  }
}

// Default logger instance without context
export const logger = new Logger();
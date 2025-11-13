export class TabDetectionManager {
  private static readonly TAB_KEY_PREFIX = 'para-tab-';
  private static readonly CHECK_INTERVAL = 1000;

  private tabId: string;
  private checkInterval: NodeJS.Timeout | null = null;
  private onMultipleTabsCallback?: (hasMultipleTabs: boolean) => void;
  private lastState: boolean = false;
  private isCleanedUp: boolean = false;
  private isMobile: boolean;

  constructor() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.tabId = this.generateTabId();
    this.init();
  }

  private generateTabId(): string {
    return `${TabDetectionManager.TAB_KEY_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private init(): void {
    // Skip all tab detection on mobile
    if (this.isMobile) {
      return;
    }

    // Register this tab
    this.registerTab();

    // Start checking for multiple tabs
    this.startChecking();

    // Listen for storage changes (when other tabs are added/removed)
    this.setupStorageListener();

    // Listen for focus to trigger immediate check
    this.setupFocusListener();

    // Cleanup on page unload
    this.setupCleanupListener();
  }

  private registerTab(): void {
    if (this.isCleanedUp || this.isMobile) return;
    localStorage.setItem(this.tabId, Date.now().toString());
  }

  private getTabCount(): number {
    if (this.isMobile) return 1; // Always return 1 on mobile (no multiple tab warning)

    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(TabDetectionManager.TAB_KEY_PREFIX)) {
        count++;
      }
    }
    return count;
  }

  private startChecking(): void {
    if (this.isMobile) return;

    this.checkInterval = setInterval(() => {
      if (!this.isCleanedUp) {
        this.registerTab(); // Keep this tab alive
        this.checkMultipleTabs();
      }
    }, TabDetectionManager.CHECK_INTERVAL);

    // Check immediately
    setTimeout(() => this.checkMultipleTabs(), 100);
  }

  private setupStorageListener(): void {
    if (this.isMobile) return;

    window.addEventListener('storage', event => {
      if (event.key && event.key.startsWith(TabDetectionManager.TAB_KEY_PREFIX) && !this.isCleanedUp) {
        // Another tab was added or removed
        setTimeout(() => this.checkMultipleTabs(), 50);
      }
    });
  }

  private setupFocusListener(): void {
    if (this.isMobile) return;

    // Check when tab gains focus (for mobile reliability)
    window.addEventListener('focus', () => {
      if (!this.isCleanedUp) {
        this.registerTab();
        setTimeout(() => this.checkMultipleTabs(), 100);
      }
    });

    // Also check on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isCleanedUp) {
        this.registerTab();
        setTimeout(() => this.checkMultipleTabs(), 100);
      }
    });
  }

  private setupCleanupListener(): void {
    if (this.isMobile) return;

    const cleanup = () => {
      if (this.isCleanedUp) return;
      this.isCleanedUp = true;

      // Remove this tab's key
      localStorage.removeItem(this.tabId);

      // Clear interval
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
    };

    // Multiple cleanup events for reliability
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
    window.addEventListener('unload', cleanup);
  }

  private checkMultipleTabs(): void {
    if (this.isCleanedUp || this.isMobile) return;

    const tabCount = this.getTabCount();
    const hasMultipleTabs = tabCount > 1;

    if (hasMultipleTabs !== this.lastState) {
      this.lastState = hasMultipleTabs;
      if (this.onMultipleTabsCallback) {
        this.onMultipleTabsCallback(hasMultipleTabs);
      }
    }
  }

  public onMultipleTabs(callback: (hasMultipleTabs: boolean) => void): void {
    this.onMultipleTabsCallback = callback;
    if (!this.isCleanedUp && !this.isMobile) {
      setTimeout(() => this.checkMultipleTabs(), 100);
    }
  }

  public getActiveTabCount(): number {
    return this.getTabCount();
  }

  public cleanup(): void {
    if (this.isCleanedUp || this.isMobile) return;
    this.isCleanedUp = true;

    localStorage.removeItem(this.tabId);

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

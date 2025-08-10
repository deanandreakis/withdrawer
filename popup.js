class PopupController {
  constructor() {
    this.init();
  }

  async init() {
    await this.checkCurrentTab();
    this.setupEventListeners();
    this.startStatusUpdates();
  }

  async checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && tab.url && tab.url.includes('linkedin.com/mynetwork/invitation-manager/sent')) {
        this.showOnPageUI();
        this.updateStatus(tab);
      } else {
        this.showInstructionsUI();
      }
    } catch (error) {
      console.error('Error checking current tab:', error);
      this.showInstructionsUI();
    }
  }

  showOnPageUI() {
    document.getElementById('not-on-page').classList.add('hidden');
    document.getElementById('on-page').classList.remove('hidden');
  }

  showInstructionsUI() {
    document.getElementById('not-on-page').classList.remove('hidden');
    document.getElementById('on-page').classList.add('hidden');
  }

  async updateStatus(tab) {
    try {
      // Try to get status from content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
      
      if (response) {
        document.getElementById('page-status').textContent = response.isActive ? 'Active' : 'Ready';
        document.getElementById('invitations-count').textContent = response.invitationsCount || '0';
        document.getElementById('withdrawn-count').textContent = response.withdrawnCount || '0';
      }
    } catch (error) {
      // Content script might not be loaded yet, this is normal
      document.getElementById('page-status').textContent = 'Loading...';
    }
  }

  setupEventListeners() {
    document.getElementById('refresh-status').addEventListener('click', () => {
      this.checkCurrentTab();
    });

    // Listen for tab updates
    if (chrome.tabs && chrome.tabs.onUpdated) {
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete') {
          this.checkCurrentTab();
        }
      });
    }
  }

  startStatusUpdates() {
    // Update status every 2 seconds when on the correct page
    setInterval(() => {
      const onPageElement = document.getElementById('on-page');
      if (!onPageElement.classList.contains('hidden')) {
        this.checkCurrentTab();
      }
    }, 2000);
  }
}

// Content script message handler for getting status
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'statusUpdate') {
    // Update popup with status from content script
    if (request.data) {
      document.getElementById('invitations-count').textContent = request.data.invitationsCount || '0';
      document.getElementById('withdrawn-count').textContent = request.data.withdrawnCount || '0';
      document.getElementById('page-status').textContent = request.data.isActive ? 'Running' : 'Ready';
    }
  }
});

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PopupController());
} else {
  new PopupController();
}
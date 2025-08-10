class SimpleLinkedInWithdrawer {
  constructor() {
    this.isRunning = false;
    this.withdrawnCount = 0;
    this.failedCount = 0;
    this.delay = 2000; // 2 seconds between actions
    this.init();
  }

  init() {
    this.createControlPanel();
  }

  createControlPanel() {
    if (document.getElementById('linkedin-withdrawer-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'linkedin-withdrawer-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #0073b1;
      color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-width: 280px;
    `;

    panel.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold;">LinkedIn Invitation Withdrawer</div>
      <div id="invitation-count" style="margin-bottom: 10px;">Click "Scan" to find invitations</div>
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px;">Delay between actions (ms):</label>
        <input type="number" id="delay-input" value="2000" min="1000" max="10000" style="width: 100%; padding: 4px; color: black;">
      </div>
      <div style="display: flex; gap: 10px; margin-bottom: 10px;">
        <button id="scan-invitations" style="flex: 1; padding: 8px; background: #6c757d; border: none; color: white; border-radius: 4px; cursor: pointer;">Scan</button>
        <button id="start-withdraw" style="flex: 1; padding: 8px; background: #28a745; border: none; color: white; border-radius: 4px; cursor: pointer;" disabled>Start</button>
        <button id="stop-withdraw" style="flex: 1; padding: 8px; background: #dc3545; border: none; color: white; border-radius: 4px; cursor: pointer;" disabled>Stop</button>
      </div>
      <div id="progress-info" style="font-size: 12px; opacity: 0.9;">
        Withdrawn: <span id="withdrawn-count">0</span> | 
        Failed: <span id="failed-count">0</span>
      </div>
    `;

    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('scan-invitations').addEventListener('click', () => this.scanForInvitations());
    document.getElementById('start-withdraw').addEventListener('click', () => this.startWithdrawal());
    document.getElementById('stop-withdraw').addEventListener('click', () => this.stopWithdrawal());
    document.getElementById('delay-input').addEventListener('change', (e) => {
      this.delay = Math.max(1000, parseInt(e.target.value) || 2000);
    });
  }

  scanForInvitations() {
    console.log('🔍 Scanning for withdraw buttons...');
    
    const scanButton = document.getElementById('scan-invitations');
    scanButton.disabled = true;
    scanButton.textContent = 'Scanning...';
    
    // Find all withdraw buttons
    const allButtons = document.querySelectorAll('button');
    const withdrawButtons = [];
    
    allButtons.forEach((button, index) => {
      const text = button.textContent.toLowerCase().trim();
      if (text === 'withdraw') {
        console.log(`✅ Found withdraw button ${withdrawButtons.length + 1}:`, button);
        withdrawButtons.push(button);
      }
    });
    
    this.withdrawButtons = withdrawButtons;
    console.log(`Found ${withdrawButtons.length} withdraw buttons total`);
    
    // Update UI
    const countElement = document.getElementById('invitation-count');
    const startButton = document.getElementById('start-withdraw');
    
    if (withdrawButtons.length > 0) {
      countElement.textContent = `Found ${withdrawButtons.length} invitations to withdraw`;
      startButton.disabled = false;
    } else {
      countElement.textContent = `No withdraw buttons found. Make sure you're on the "Sent" invitations page.`;
      startButton.disabled = true;
    }
    
    scanButton.disabled = false;
    scanButton.textContent = 'Re-scan';
  }

  async startWithdrawal() {
    console.log('🚀 Starting withdrawal process...');
    
    if (this.isRunning) {
      console.log('⏸️ Already running, ignoring request');
      return;
    }

    if (!this.withdrawButtons || this.withdrawButtons.length === 0) {
      alert('Please scan for invitations first!');
      return;
    }

    this.isRunning = true;
    this.withdrawnCount = 0;
    this.failedCount = 0;

    const startButton = document.getElementById('start-withdraw');
    const stopButton = document.getElementById('stop-withdraw');
    const scanButton = document.getElementById('scan-invitations');
    
    if (startButton) startButton.disabled = true;
    if (stopButton) stopButton.disabled = false;
    if (scanButton) scanButton.disabled = true;

    console.log(`🎯 Starting withdrawal of ${this.withdrawButtons.length} invitations`);

    for (let i = 0; i < this.withdrawButtons.length && this.isRunning; i++) {
      console.log(`📤 Processing invitation ${i + 1}/${this.withdrawButtons.length}`);
      
      try {
        await this.withdrawInvitation(this.withdrawButtons[i], i + 1);
        this.withdrawnCount++;
        console.log(`✅ Successfully withdrawn invitation ${i + 1}`);
      } catch (error) {
        console.error(`❌ Failed to withdraw invitation ${i + 1}:`, error);
        this.failedCount++;
      }

      this.updateProgress();

      if (i < this.withdrawButtons.length - 1 && this.isRunning) {
        console.log(`⏳ Waiting ${this.delay}ms before next withdrawal...`);
        await this.sleep(this.delay);
      }
    }

    this.stopWithdrawal();
    console.log(`🏁 Withdrawal complete! Withdrawn: ${this.withdrawnCount}, Failed: ${this.failedCount}`);
    
    if (this.withdrawnCount > 0) {
      alert(`Withdrawal complete! Successfully withdrew ${this.withdrawnCount} invitations. ${this.failedCount} failed.`);
    }
  }

  async withdrawInvitation(withdrawButton, index = 0) {
    console.log(`🎯 Withdrawing invitation ${index}...`);
    
    if (!withdrawButton || !withdrawButton.offsetParent) {
      throw new Error(`Button no longer available for invitation ${index}`);
    }

    console.log('📍 Scrolling button into view...');
    // Scroll the button into view
    withdrawButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await this.sleep(500);

    console.log('🖱️ Clicking withdraw button...');
    // Click withdraw button with error handling
    try {
      withdrawButton.click();
    } catch (error) {
      console.error('Failed to click withdraw button:', error);
      throw new Error(`Failed to click withdraw button: ${error.message}`);
    }
    
    await this.sleep(1500); // Wait for any confirmation dialog

    console.log('🔍 Looking for confirmation dialog...');
    // Look for and click confirmation button
    const confirmationButton = await this.waitForConfirmationButton();
    if (confirmationButton) {
      console.log('✅ Found confirmation button, clicking...');
      try {
        confirmationButton.click();
        await this.sleep(1000);
      } catch (error) {
        console.error('Failed to click confirmation button:', error);
        throw new Error(`Failed to click confirmation button: ${error.message}`);
      }
    } else {
      console.warn('⚠️ No confirmation button found - invitation may have been withdrawn without confirmation');
    }
    
    console.log(`✅ Invitation ${index} withdrawal process completed`);
  }

  async waitForConfirmationButton(timeout = 5000) {
    const start = Date.now();
    console.log('🔍 Waiting for confirmation button...');
    
    while (Date.now() - start < timeout) {
      // Look for any buttons that might be confirmation buttons
      const allButtons = document.querySelectorAll('button');
      
      for (const button of allButtons) {
        const text = button.textContent.toLowerCase().trim();
        const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
        
        // Look for confirmation-style buttons
        if (text === 'withdraw' || text === 'confirm' || text === 'yes' || 
            text === 'ok' || text === 'continue' || text === 'proceed' ||
            ariaLabel.includes('withdraw') || ariaLabel.includes('confirm')) {
          
          // Make sure this button is visible and likely a confirmation
          const rect = button.getBoundingClientRect();
          if (rect.top > 0 && rect.left > 0 && button.offsetParent !== null) {
            console.log(`✅ Found potential confirmation button: "${text}"`);
            return button;
          }
        }
      }

      await this.sleep(300);
    }

    console.log('❌ Confirmation button not found after timeout - proceeding anyway');
    return null;
  }

  stopWithdrawal() {
    this.isRunning = false;
    
    const startButton = document.getElementById('start-withdraw');
    const stopButton = document.getElementById('stop-withdraw');
    const scanButton = document.getElementById('scan-invitations');
    
    if (startButton) startButton.disabled = false;
    if (stopButton) stopButton.disabled = true;
    if (scanButton) scanButton.disabled = false;
  }

  updateProgress() {
    document.getElementById('withdrawn-count').textContent = this.withdrawnCount;
    document.getElementById('failed-count').textContent = this.failedCount;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize when page is loaded and we're on the sent invitations page
if (window.location.href.includes('/mynetwork/invitation-manager/sent')) {
  // Wait for the page to fully load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => new SimpleLinkedInWithdrawer(), 1000);
    });
  } else {
    setTimeout(() => new SimpleLinkedInWithdrawer(), 1000);
  }
}

// Handle navigation to the page via AJAX (single page app)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (url.includes('/mynetwork/invitation-manager/sent')) {
      setTimeout(() => {
        if (!document.getElementById('linkedin-withdrawer-panel')) {
          new SimpleLinkedInWithdrawer();
        }
      }, 2000);
    } else {
      const panel = document.getElementById('linkedin-withdrawer-panel');
      if (panel) panel.remove();
    }
  }
}).observe(document, { subtree: true, childList: true });
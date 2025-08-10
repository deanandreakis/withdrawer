class LinkedInWithdrawer {
  constructor() {
    this.isRunning = false;
    this.withdrawnCount = 0;
    this.failedCount = 0;
    this.delay = 2000; // 2 seconds between actions
    this.maxRetries = 3;
    this.cachedInvitations = null;
    this.lastScanTime = 0;
    this.init();
  }

  init() {
    this.createControlPanel();
    // Disable the problematic observer - we'll update manually
    // this.observePageChanges();
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
      <div id="invitation-count" style="margin-bottom: 10px;">Scanning for invitations...</div>
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px;">Delay between actions (ms):</label>
        <input type="number" id="delay-input" value="2000" min="1000" max="10000" style="width: 100%; padding: 4px; color: black;">
      </div>
      <div style="display: flex; gap: 10px; margin-bottom: 10px;">
        <button id="start-withdraw" style="flex: 1; padding: 8px; background: #28a745; border: none; color: white; border-radius: 4px; cursor: pointer;">Start Withdrawal</button>
        <button id="stop-withdraw" style="flex: 1; padding: 8px; background: #dc3545; border: none; color: white; border-radius: 4px; cursor: pointer;" disabled>Stop</button>
      </div>
      <div id="progress-info" style="font-size: 12px; opacity: 0.9;">
        Withdrawn: <span id="withdrawn-count">0</span> | 
        Failed: <span id="failed-count">0</span>
      </div>
    `;

    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('start-withdraw').addEventListener('click', () => this.startWithdrawal());
    document.getElementById('stop-withdraw').addEventListener('click', () => this.stopWithdrawal());
    document.getElementById('delay-input').addEventListener('change', (e) => {
      this.delay = Math.max(1000, parseInt(e.target.value) || 2000);
    });

    // Do one initial scan, then leave it
    setTimeout(() => this.updateInvitationCount(), 2000);
  }

  observePageChanges() {
    let debounceTimer = null;
    
    const observer = new MutationObserver(() => {
      // Debounce the updates to prevent infinite loops
      if (debounceTimer) clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        if (!this.isRunning) { // Only update when not actively withdrawing
          this.updateInvitationCount();
        }
      }, 1000); // Wait 1 second after DOM stops changing
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  updateInvitationCount() {
    // Cache results to avoid repeated scans
    const now = Date.now();
    if (this.cachedInvitations && (now - this.lastScanTime) < 5000) {
      // Use cached results if less than 5 seconds old
      const countElement = document.getElementById('invitation-count');
      if (countElement) {
        countElement.textContent = `Found ${this.cachedInvitations.length} pending invitations`;
      }
      return;
    }

    console.log('🔄 Updating invitation count...');
    this.cachedInvitations = this.findPendingInvitations();
    this.lastScanTime = now;
    
    const countElement = document.getElementById('invitation-count');
    if (countElement) {
      countElement.textContent = `Found ${this.cachedInvitations.length} pending invitations`;
    }
  }

  findPendingInvitations() {
    console.log('🔍 Searching for pending invitations using 2025 LinkedIn structure...');
    
    // LinkedIn now uses CSS-in-JS with hashed class names
    // Based on debug results: buttons have classes starting with "_7e10a2d3 cceca236..."
    const withdrawButtons = document.querySelectorAll('button');
    const validWithdrawButtons = [];
    
    console.log(`Found ${withdrawButtons.length} total buttons on page`);
    
    // Filter buttons that contain "Withdraw" text
    withdrawButtons.forEach((button, index) => {
      const text = button.textContent.toLowerCase().trim();
      if (text === 'withdraw') {
        console.log(`✅ Found withdraw button ${index + 1}: "${button.textContent}"`);
        validWithdrawButtons.push(button);
      }
    });
    
    console.log(`Found ${validWithdrawButtons.length} withdraw buttons`);
    
    // For each withdraw button, find its parent invitation container
    const invitations = validWithdrawButtons.map((button, index) => {
      // Find the invitation container - look for parent elements that likely contain the full invitation
      let container = button.parentElement;
      let depth = 0;
      const maxDepth = 10;
      
      while (container && depth < maxDepth) {
        // Look for containers that seem to hold invitation info
        const containerText = container.textContent;
        
        // Check if this container has person name, title, or other invitation info
        if (containerText.length > 50 && // Has substantial content
            containerText.includes('Withdraw') && // Contains withdraw text
            (containerText.includes('Sent') || // Has timing info
             containerText.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/))) { // Has person name pattern
          
          console.log(`✅ Found invitation container ${index + 1} at depth ${depth}:`, container);
          return {
            container: container,
            button: button,
            index: index + 1
          };
        }
        
        container = container.parentElement;
        depth++;
      }
      
      // Fallback: use immediate parent
      console.log(`⚠️ Using fallback container for button ${index + 1}`);
      return {
        container: button.parentElement,
        button: button,
        index: index + 1
      };
    });
    
    console.log(`✅ Found ${invitations.length} invitation containers`);
    
    // Return the containers, but store button reference for easy access
    return invitations.map(inv => {
      inv.container._withdrawButton = inv.button; // Store reference
      inv.container._invitationIndex = inv.index;
      return inv.container;
    });
  }

  findWithdrawButton(invitationCard) {
    if (!invitationCard) return null;
    
    // Check if we already stored the button reference during findPendingInvitations
    if (invitationCard._withdrawButton) {
      console.log(`✅ Using stored withdraw button for invitation ${invitationCard._invitationIndex}`);
      return invitationCard._withdrawButton;
    }
    
    console.log('🔍 Looking for withdraw button in container (fallback method):', invitationCard);
    
    // Fallback: search within the container for withdraw buttons
    const allButtons = invitationCard.querySelectorAll('button');
    console.log(`🔍 Checking ${allButtons.length} buttons for "withdraw" text...`);
    
    for (const button of allButtons) {
      const buttonText = button.textContent.toLowerCase().trim();
      
      console.log(`Button text: "${buttonText}"`);
      
      if (buttonText === 'withdraw') {
        console.log('✅ Found withdraw button by text match:', button);
        return button;
      }
    }

    console.log('❌ No withdraw button found in this invitation card');
    return null;
  }

  async startWithdrawal() {
    console.log('🚀 Starting withdrawal process...');
    
    if (this.isRunning) {
      console.log('⏸️ Already running, ignoring request');
      return;
    }

    this.isRunning = true;
    this.withdrawnCount = 0;
    this.failedCount = 0;

    const startButton = document.getElementById('start-withdraw');
    const stopButton = document.getElementById('stop-withdraw');
    
    if (startButton) startButton.disabled = true;
    if (stopButton) stopButton.disabled = false;

    // Get fresh data for withdrawal (ignore cache)
    this.cachedInvitations = null;
    const invitations = this.findPendingInvitations();
    console.log(`🎯 Starting withdrawal process for ${invitations.length} invitations`);
    
    if (invitations.length === 0) {
      console.warn('⚠️ No invitations found to withdraw!');
      alert('No pending invitations found on this page. Make sure you are on the "Sent" invitations page and have pending invitations.');
      this.stopWithdrawal();
      return;
    }

    for (let i = 0; i < invitations.length && this.isRunning; i++) {
      console.log(`📤 Processing invitation ${i + 1}/${invitations.length}`);
      
      try {
        await this.withdrawInvitation(invitations[i], i + 1);
        this.withdrawnCount++;
        console.log(`✅ Successfully withdrawn invitation ${i + 1}`);
      } catch (error) {
        console.error(`❌ Failed to withdraw invitation ${i + 1}:`, error);
        this.failedCount++;
      }

      this.updateProgress();

      if (i < invitations.length - 1 && this.isRunning) {
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

  async withdrawInvitation(invitationCard, index = 0) {
    console.log(`🎯 Withdrawing invitation ${index}...`);
    
    const withdrawButton = this.findWithdrawButton(invitationCard);
    
    if (!withdrawButton) {
      throw new Error(`Withdraw button not found for invitation ${index}`);
    }

    console.log('📍 Scrolling invitation into view...');
    // Scroll the invitation into view
    invitationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await this.sleep(500);

    console.log('🖱️ Clicking withdraw button...');
    // Click withdraw button with error handling
    try {
      withdrawButton.click();
    } catch (error) {
      console.error('Failed to click withdraw button:', error);
      throw new Error(`Failed to click withdraw button: ${error.message}`);
    }
    
    await this.sleep(1500); // Wait for modal to appear

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

  async waitForConfirmationButton(timeout = 8000) {
    const start = Date.now();
    console.log('🔍 Waiting for confirmation button in new LinkedIn structure...');
    
    while (Date.now() - start < timeout) {
      // LinkedIn's new structure may not use traditional modal classes
      // Look for any buttons that appear after clicking withdraw
      const allButtons = document.querySelectorAll('button');
      
      for (const button of allButtons) {
        const text = button.textContent.toLowerCase().trim();
        const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
        
        // Look for confirmation-style buttons
        if ((text === 'withdraw' && button.offsetParent !== null) ||
            text === 'confirm' || text === 'yes' || text === 'ok' ||
            text === 'continue' || text === 'proceed' ||
            ariaLabel.includes('withdraw') || ariaLabel.includes('confirm')) {
          
          // Make sure this isn't one of the original withdraw buttons by checking if it's in a different location
          const rect = button.getBoundingClientRect();
          if (rect.top > 0 && rect.left > 0) { // visible
            console.log(`✅ Found potential confirmation button: "${text}", aria-label: "${ariaLabel}"`, button);
            return button;
          }
        }
      }
      
      // Also check for any overlay/modal-like elements that might contain confirmation
      const overlaySelectors = [
        '[role="dialog"]',
        '[aria-modal="true"]',
        '.artdeco-modal',
        '[data-test-modal-container]',
        'div[style*="position: fixed"]',
        'div[style*="z-index"]'
      ];
      
      for (const selector of overlaySelectors) {
        const overlay = document.querySelector(selector);
        if (overlay && overlay.offsetParent !== null) {
          console.log(`🔍 Found overlay element: ${selector}`);
          const overlayButtons = overlay.querySelectorAll('button');
          
          for (const button of overlayButtons) {
            const text = button.textContent.toLowerCase().trim();
            console.log(`Overlay button text: "${text}"`);
            
            if (text === 'withdraw' || text === 'confirm' || text === 'yes' || 
                text === 'ok' || text === 'continue') {
              console.log('✅ Found confirmation button in overlay:', button);
              return button;
            }
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
    
    startButton.disabled = false;
    stopButton.disabled = true;
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
      setTimeout(() => new LinkedInWithdrawer(), 1000);
    });
  } else {
    setTimeout(() => new LinkedInWithdrawer(), 1000);
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
          new LinkedInWithdrawer();
        }
      }, 2000);
    } else {
      const panel = document.getElementById('linkedin-withdrawer-panel');
      if (panel) panel.remove();
    }
  }
}).observe(document, { subtree: true, childList: true });
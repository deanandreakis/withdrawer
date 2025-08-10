// LinkedIn DOM Debug Script
// Run this in the console on your LinkedIn sent invitations page

console.log('🔍 LinkedIn DOM Debug Script - Analyzing your page structure...');
console.log('Current URL:', window.location.href);

// Function to analyze elements
function analyzeElements(selector, description) {
  const elements = document.querySelectorAll(selector);
  console.log(`\n${description}:`);
  console.log(`  Selector: ${selector}`);
  console.log(`  Found: ${elements.length} elements`);
  
  if (elements.length > 0) {
    console.log(`  First element:`, elements[0]);
    console.log(`  Classes:`, elements[0].className);
    console.log(`  Text content (first 100 chars):`, elements[0].textContent?.substring(0, 100));
  }
  
  return elements;
}

console.log('\n=== ANALYZING INVITATION CONTAINERS ===');

// Test all possible invitation container selectors
const containerSelectors = [
  'li.invitation-card',
  '.invitation-card',
  'div.invitation-card__action-container',
  '.invitation-card__content',
  '[data-test-invitation-card]',
  '.artdeco-list__item',
  'li[data-view-name]',
  '.mn-invitation-card',
  '.invite-card',
  '[data-control-name*="invitation"]'
];

let foundContainers = [];
containerSelectors.forEach(selector => {
  const elements = analyzeElements(selector, `Testing container selector`);
  if (elements.length > 0) {
    foundContainers.push({ selector, count: elements.length, elements });
  }
});

console.log('\n=== ANALYZING WITHDRAW BUTTONS ===');

// Test all possible withdraw button selectors
const buttonSelectors = [
  'button[data-control-name="withdraw"]',
  'button[data-control-name*="withdraw"]',
  'button.invitation-card__action-btn',
  'button[aria-label*="withdraw"]',
  'button[aria-label*="Withdraw"]',
  '.artdeco-button--secondary[aria-label*="withdraw"]',
  '.artdeco-button[data-control-name*="withdraw"]'
];

let foundButtons = [];
buttonSelectors.forEach(selector => {
  const elements = analyzeElements(selector, `Testing button selector`);
  if (elements.length > 0) {
    foundButtons.push({ selector, count: elements.length, elements });
  }
});

console.log('\n=== FALLBACK ANALYSIS ===');

// Look for any buttons that might be withdraw buttons
const allButtons = document.querySelectorAll('button');
console.log(`\nFound ${allButtons.length} total buttons on page`);

let withdrawButtons = [];
allButtons.forEach((button, index) => {
  const text = button.textContent.toLowerCase().trim();
  const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
  
  if (text.includes('withdraw') || ariaLabel.includes('withdraw')) {
    withdrawButtons.push({
      index,
      button,
      text: button.textContent,
      ariaLabel: button.getAttribute('aria-label'),
      classes: button.className
    });
  }
});

console.log(`\nFound ${withdrawButtons.length} buttons with "withdraw" text/aria-label:`);
withdrawButtons.forEach((item, i) => {
  console.log(`  ${i + 1}. Text: "${item.text}", Aria-label: "${item.ariaLabel}", Classes: "${item.classes}"`);
});

console.log('\n=== PAGE STRUCTURE ANALYSIS ===');

// Look for common LinkedIn page elements
const pageElements = [
  'main',
  '[data-view-name]',
  '.artdeco-list',
  '.mn-invitation-manager',
  '.invitation-manager',
  '[role="main"]'
];

pageElements.forEach(selector => {
  analyzeElements(selector, `Page structure element`);
});

console.log('\n=== SUMMARY ===');
console.log(`\nContainer candidates: ${foundContainers.length}`);
foundContainers.forEach(item => {
  console.log(`  - ${item.selector}: ${item.count} elements`);
});

console.log(`\nButton candidates: ${foundButtons.length}`);
foundButtons.forEach(item => {
  console.log(`  - ${item.selector}: ${item.count} elements`);
});

console.log(`\nWithdraw buttons found by text: ${withdrawButtons.length}`);

// Generate suggested selectors
console.log('\n=== SUGGESTED SELECTORS ===');
if (foundContainers.length > 0) {
  const bestContainer = foundContainers.reduce((a, b) => a.count > b.count ? a : b);
  console.log(`Best container selector: ${bestContainer.selector} (${bestContainer.count} elements)`);
}

if (foundButtons.length > 0) {
  const bestButton = foundButtons.reduce((a, b) => a.count > b.count ? a : b);
  console.log(`Best button selector: ${bestButton.selector} (${bestButton.count} elements)`);
} else if (withdrawButtons.length > 0) {
  console.log('No direct button selectors found, but found buttons with withdraw text');
  console.log('Recommended approach: search by text content');
}

console.log('\n✅ Analysis complete! Copy the results above and share them.');

// Store results in global variable for easy access
window.linkedinDebugResults = {
  containers: foundContainers,
  buttons: foundButtons,
  withdrawButtons: withdrawButtons,
  url: window.location.href,
  timestamp: new Date().toISOString()
};
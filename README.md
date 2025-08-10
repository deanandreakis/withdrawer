# LinkedIn Invitation Withdrawer

A Chrome extension that helps you safely withdraw LinkedIn connection invitations in bulk, with built-in rate limiting to avoid triggering LinkedIn's anti-spam measures.

## Features

- **Bulk Withdrawal**: Withdraw multiple pending connection invitations at once
- **Rate Limiting**: 2-second delay between actions to avoid detection
- **Safe Operation**: Multiple fallback selectors to work with LinkedIn's changing DOM
- **Progress Tracking**: Real-time count of withdrawn and failed invitations
- **User-Friendly**: Simple popup interface and on-page controls
- **Non-Intrusive**: Only activates on LinkedIn's sent invitations page

## Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. **Generate Icons** (if you have ImageMagick or Inkscape installed):
   ```bash
   ./create_icons.sh
   ```
   
   If you don't have these tools, manually convert `icons/icon.svg` to PNG files:
   - `icons/icon16.png` (16x16 pixels)
   - `icons/icon48.png` (48x48 pixels)
   - `icons/icon128.png` (128x128 pixels)

2. **Load Extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select this project folder

### Method 2: Package and Install

1. Generate icons (see step 1 above)
2. Package the extension:
   - Go to `chrome://extensions/`
   - Click "Pack extension"
   - Select this project folder
   - Install the generated `.crx` file

## Usage

### Step-by-Step Guide

1. **Navigate to Sent Invitations**:
   - Go to [LinkedIn](https://www.linkedin.com)
   - Click "My Network" in the top navigation
   - Click "Manage invitations" 
   - Select the "Sent" tab

2. **Use the Extension**:
   - The extension will automatically detect you're on the correct page
   - A control panel will appear in the top-right corner
   - Click "Start Withdrawal" to begin the process
   - The extension will process invitations with a 2-second delay between each action

3. **Monitor Progress**:
   - Watch the real-time counter for withdrawn and failed invitations
   - Use "Stop" button to halt the process at any time
   - Adjust the delay if needed (minimum 1 second, recommended 2+ seconds)

### Using the Popup

- Click the extension icon in your browser toolbar
- If you're not on the right page, click "Go to Sent Invitations"
- The popup shows current status and progress when active

## Important Notes

⚠️ **Use Responsibly**: This extension includes rate limiting to avoid triggering LinkedIn's anti-spam detection. Using automation tools excessively may result in account limitations.

⚠️ **Three-Week Limit**: After withdrawing an invitation, LinkedIn prevents you from sending a new invitation to the same person for 3 weeks.

⚠️ **Visible Invitations Only**: The extension only processes invitations currently visible on the page. If you have multiple pages of invitations, scroll down or navigate to see more.

## Technical Details

### Files Structure

```
linkedin-invitation-withdrawer/
├── manifest.json          # Extension configuration
├── content.js            # Main logic for interacting with LinkedIn
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
├── icons/               # Extension icons
│   ├── icon.svg         # Source icon
│   ├── icon16.png       # 16x16 icon
│   ├── icon48.png       # 48x48 icon
│   └── icon128.png      # 128x128 icon
├── create_icons.sh      # Script to generate PNG icons
└── README.md           # This file
```

### How It Works

1. **Page Detection**: Monitors URL changes to detect when you navigate to the sent invitations page
2. **DOM Scanning**: Uses multiple selector strategies to find invitation cards and withdraw buttons
3. **Safe Interaction**: Scrolls invitations into view before interacting with them
4. **Confirmation Handling**: Automatically handles LinkedIn's withdrawal confirmation dialogs
5. **Error Handling**: Gracefully handles missing elements and network issues

### Browser Compatibility

- **Chrome**: Fully supported (Manifest V3)
- **Edge**: Should work with minor modifications
- **Firefox**: Would require conversion to Manifest V2

## Safety Features

- **Rate Limiting**: Configurable delay between actions (default 2 seconds)
- **Graceful Degradation**: Multiple fallback selectors for DOM changes
- **User Control**: Start/stop functionality with real-time feedback
- **Error Handling**: Continues operation even if individual withdrawals fail
- **Non-Destructive**: Only withdraws invitations, doesn't modify other data

## Troubleshooting

### Extension Not Working
- Ensure you're on the correct LinkedIn page: `/mynetwork/invitation-manager/sent/`
- Refresh the page after installing the extension
- Check browser console for error messages

### No Invitations Found
- Make sure you have pending sent invitations
- Scroll down to load more invitations if you have multiple pages
- LinkedIn may have changed their DOM structure (check for updates)

### Withdrawals Failing
- Increase the delay between actions in the control panel
- Check your internet connection
- LinkedIn may be experiencing issues or have updated their interface

## Legal and Ethical Considerations

This extension is designed for personal use to manage your own LinkedIn invitations. Users should:

- Respect LinkedIn's Terms of Service
- Use the tool responsibly and not excessively
- Be aware that automation may be against LinkedIn's policies
- Use at their own risk

## Contributing

This is a defensive security tool designed to help users manage their own sent invitations. Contributions should focus on:

- Improving reliability and error handling
- Updating selectors for LinkedIn DOM changes
- Enhancing user interface and experience
- Adding safety features

## License

This project is provided as-is for educational and personal use. Users are responsible for compliance with LinkedIn's Terms of Service and applicable laws.

---

**Disclaimer**: This extension is not affiliated with LinkedIn. Use at your own risk and in accordance with LinkedIn's Terms of Service.
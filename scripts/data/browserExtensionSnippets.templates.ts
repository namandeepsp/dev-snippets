import type { SnippetTemplate } from './snippet.templates'

export const BROWSER_EXTENSION_SNIPPET_TEMPLATES: SnippetTemplate[] = [
  {
    title: 'Basic manifest.json',
    description: 'Minimal manifest file for a browser extension. Usage: Required for all extensions',
    code: `{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0",
  "description": "A useful browser extension",
  "permissions": ["activeTab", "scripting"],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Click me"
  }
}`,
    language: 'json',
    technologies: ['browser-extension'],
    categories: ['frontend'],
  },
  {
    title: 'Content Script Injection',
    description: 'Inject scripts into web pages. Usage: Modify page content',
    code: `// manifest.json
"content_scripts": [
  {
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }
]

// content.js
console.log('Content script loaded on:', window.location.href);
document.body.style.backgroundColor = 'lightblue';`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['frontend'],
  },
  {
    title: 'Background Service Worker',
    description: 'Long-running background tasks. Usage: Handle events and timers',
    code: `// manifest.json
"background": {
  "service_worker": "background.js"
}

// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab loaded:', tab.url);
  }
});`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['backend'],
  },
  {
    title: 'Message Passing Between Scripts',
    description: 'Communicate between content script and background script. Usage: Send data',
    code: `// content.js - Send message
chrome.runtime.sendMessage(
  { action: 'pageData', url: window.location.href },
  (response) => console.log('Response:', response)
);

// background.js - Receive message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pageData') {
    console.log('Page URL:', request.url);
    sendResponse({ status: 'received' });
  }
});`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['backend'],
  },
  {
    title: 'Storage API Usage',
    description: 'Persist data using Chrome storage. Usage: Save user preferences',
    code: `// Save data
chrome.storage.local.set({ key: 'value', count: 42 }, () => {
  console.log('Data saved');
});

// Retrieve data
chrome.storage.local.get(['key', 'count'], (result) => {
  console.log('Key:', result.key);
  console.log('Count:', result.count);
});

// Clear storage
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
});`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['backend'],
  },
  {
    title: 'Popup HTML and Styling',
    description: 'Create extension popup interface. Usage: User interaction UI',
    code: `<!-- popup.html -->
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <h1>My Extension</h1>
  <button id="myButton">Click Me</button>
  <p id="status"></p>
  <script src="popup.js"></script>
</body>
</html>

/* popup.css */
body {
  width: 300px;
  padding: 10px;
  font-family: Arial, sans-serif;
}

button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}`,
    language: 'html',
    technologies: ['browser-extension', 'html'],
    categories: ['frontend'],
  },
  {
    title: 'Popup Script Interaction',
    description: 'Handle popup button clicks and updates. Usage: User actions',
    code: `// popup.js
document.getElementById('myButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'doSomething' });
  });
});

// Update status
chrome.storage.local.get('status', (result) => {
  document.getElementById('status').textContent = result.status || 'Ready';
});`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['frontend'],
  },
  {
    title: 'DOM Manipulation',
    description: 'Modify page elements dynamically. Usage: Add/remove/modify DOM nodes',
    code: `// content.js
// Add element
const banner = document.createElement('div');
banner.id = 'extension-banner';
banner.textContent = 'Extension is active';
banner.style.cssText = 'position: fixed; top: 0; width: 100%; background: #4CAF50; color: white; padding: 10px; z-index: 9999;';
document.body.insertBefore(banner, document.body.firstChild);

// Remove element
const ads = document.querySelectorAll('.ad');
ads.forEach(ad => ad.remove());

// Modify element
document.querySelectorAll('a').forEach(link => {
  link.style.color = 'red';
});`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['frontend'],
  },
  {
    title: 'Context Menu Integration',
    description: 'Add custom context menu items. Usage: Right-click menu options',
    code: `// manifest.json
"permissions": ["contextMenus"]

// background.js
chrome.contextMenus.create({
  id: 'myContextMenu',
  title: 'My Extension Action',
  contexts: ['page', 'selection', 'link']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'myContextMenu') {
    console.log('Context menu clicked');
    console.log('Selection:', info.selectionText);
    console.log('Link URL:', info.linkUrl);
  }
});`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['backend'],
  },
  {
    title: 'Tab Management',
    description: 'Create, update, and manage browser tabs. Usage: Open/close tabs',
    code: `// Open new tab
chrome.tabs.create({ url: 'https://example.com' });

// Update current tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.update(tabs[0].id, { url: 'https://newurl.com' });
});

// Close tab
chrome.tabs.remove(tabId);

// Get all tabs
chrome.tabs.query({}, (tabs) => {
  tabs.forEach(tab => console.log(tab.url));
});`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['backend'],
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Define keyboard shortcuts for extension. Usage: Quick access',
    code: `// manifest.json
"commands": {
  "toggle-feature": {
    "suggested_key": {
      "default": "Ctrl+Shift+Y",
      "mac": "Command+Shift+Y"
    },
    "description": "Toggle extension feature"
  }
}

// background.js
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-feature') {
    console.log('Shortcut pressed');
    chrome.storage.local.get('enabled', (result) => {
      const newState = !result.enabled;
      chrome.storage.local.set({ enabled: newState });
    });
  }
});`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['backend'],
  },
  {
    title: 'Fetch API with CORS',
    description: 'Make HTTP requests from extension. Usage: Get external data',
    code: `// manifest.json
"host_permissions": ["https://api.example.com/*"]

// content.js or background.js
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => {
    console.log('API Response:', data);
    chrome.storage.local.set({ apiData: data });
  })
  .catch(error => console.error('Fetch error:', error));`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['backend'],
  },
  {
    title: 'Notification API',
    description: 'Show desktop notifications. Usage: Alert user',
    code: `// manifest.json
"permissions": ["notifications"]

// background.js or content.js
chrome.notifications.create({
  type: 'basic',
  iconUrl: 'images/icon.png',
  title: 'Notification Title',
  message: 'This is a notification message',
  priority: 2
});

// Handle notification click
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('Notification clicked:', notificationId);
});`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['frontend'],
  },
  {
    title: 'Inject CSS Dynamically',
    description: 'Add CSS styles to pages dynamically. Usage: Style modifications',
    code: `// content.js
const style = document.createElement('style');
style.textContent = \`
  body {
    background-color: #f0f0f0 !important;
  }
  a {
    color: #0066cc !important;
  }
  .ads {
    display: none !important;
  }
\`;
document.head.appendChild(style);

// Or inject CSS file
chrome.scripting.insertCSS({
  target: { tabId: tabId },
  files: ['styles.css']
});`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['frontend'],
  },
  {
    title: 'Options Page',
    description: 'Create settings page for extension. Usage: User preferences',
    code: `// manifest.json
"options_page": "options.html"

<!-- options.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Extension Options</title>
</head>
<body>
  <h1>Settings</h1>
  <label>
    <input type="checkbox" id="enableFeature">
    Enable Feature
  </label>
  <button id="save">Save</button>
  <script src="options.js"></script>
</body>
</html>

// options.js
document.getElementById('save').addEventListener('click', () => {
  const enabled = document.getElementById('enableFeature').checked;
  chrome.storage.sync.set({ enableFeature: enabled });
});`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['frontend'],
  },
  {
    title: 'Web Request Interception',
    description: 'Monitor and modify network requests. Usage: Block/modify requests',
    code: `// manifest.json
"permissions": ["webRequest"],
"host_permissions": ["<all_urls>"]

// background.js
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log('Request:', details.url);
    
    // Block certain URLs
    if (details.url.includes('ads')) {
      return { cancel: true };
    }
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['backend'],
  },
  {
    title: 'Badge Counter',
    description: 'Display badge with counter on extension icon. Usage: Show notifications count',
    code: `// Set badge text
chrome.action.setBadgeText({ text: '5' });

// Set badge color
chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });

// Update badge on message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    chrome.action.setBadgeText({ text: String(request.count) });
  }
});

// Clear badge
chrome.action.setBadgeText({ text: '' });`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['frontend'],
  },
  {
    title: 'Alarms and Timers',
    description: 'Schedule tasks to run at intervals. Usage: Periodic updates',
    code: `// manifest.json
"permissions": ["alarms"]

// background.js
// Create alarm
chrome.alarms.create('myAlarm', { periodInMinutes: 5 });

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'myAlarm') {
    console.log('Alarm triggered');
    // Do something every 5 minutes
  }
});

// Clear alarm
chrome.alarms.clear('myAlarm');

// Get all alarms
chrome.alarms.getAll((alarms) => {
  console.log('Active alarms:', alarms);
});`,
    language: 'javascript',
    technologies: ['browser-extension', 'javascript'],
    categories: ['backend'],
  },
]


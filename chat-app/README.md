# little talk — Chat App

A lightweight, responsive chat interface built with HTML5, CSS3, and vanilla JavaScript. It runs directly in a browser and keeps its demo conversations in that browser's LocalStorage.

## Run locally

1. Open the `chat-app` folder in Visual Studio Code.
2. Install the **Live Server** extension if it is not already installed.
3. Open `index.html`, then select **Go Live** in the status bar (or right-click the file and choose **Open with Live Server**).
4. Your browser will open the app. No build, backend, or package installation is needed.

You can also open `index.html` directly in a modern browser. Live Server is recommended for a consistent local development experience.

## Features

- Six seeded contacts with initials, message previews, timestamps, and unread badges.
- Select a conversation to view its messages and clear the unread count.
- Send a message with the button or Enter; use Shift + Enter for a new line.
- Search contacts by name, including with the Ctrl/Command + K shortcut.
- Switch between light and dark themes; your choice is saved in this browser.
- Clear a conversation only after confirming the action.
- Persist messages, unread counts, and the selected contact in LocalStorage.
- Responsive layout: contacts and conversation side by side on desktop; contacts first with a back button on mobile.
- Accessible labels, semantic landmarks, visible keyboard focus, and helpful empty states.

## Limitations

- This is a front-end demo, not a real-time messaging service. Messages are only added to the local conversation; they are not sent to another person.
- Conversation data lives in the current browser's LocalStorage. It is not encrypted, synchronized, or shared across devices and may be removed by clearing browser data.
- Seeded conversations return if LocalStorage is unavailable or contains data the app cannot read. A notice explains storage problems when possible.
- The app uses Google Fonts when an internet connection is available and falls back to system fonts otherwise.

## Manual test checklist

- [ ] Open the app and confirm the six demo contacts, previews, and unread badges appear.
- [ ] Select a contact; confirm its thread opens and its unread badge clears.
- [ ] Search for a contact by part of their name, then search for a name with no match.
- [ ] Send a non-empty message with the button and with Enter.
- [ ] Confirm an empty or whitespace-only message is not sent; confirm Shift + Enter inserts a line break.
- [ ] Reload the page and verify messages and unread state persist.
- [ ] Clear a chat and test both canceling and confirming the confirmation prompt.
- [ ] On a narrow viewport, confirm contacts show first, a selected thread has a back button, and Back returns to contacts.
- [ ] Toggle between light and dark themes, then reload and confirm the selected theme is restored.
- [ ] Use Tab to navigate and confirm focus indicators are visible.
- [ ] If practical, disable browser storage or place invalid JSON under `littletalk-chat-state-v1` in LocalStorage and confirm the app shows a notice rather than crashing.

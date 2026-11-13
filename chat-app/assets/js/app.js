"use strict";

const STORAGE_KEY = "littletalk-chat-state-v1";
const THEME_STORAGE_KEY = "littletalk-theme-v1";
const MAX_MESSAGE_LENGTH = 2000;
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit"
});

const contacts = [
  { id: "maya", name: "Maya Chen", initials: "MC", color: "#e5f0e5" },
  { id: "leo", name: "Leo Martinez", initials: "LM", color: "#f7e9dc" },
  { id: "aisha", name: "Aisha Rahman", initials: "AR", color: "#eee8f5" },
  { id: "ben", name: "Ben Carter", initials: "BC", color: "#e3eef3" },
  { id: "nina", name: "Nina Okafor", initials: "NO", color: "#f5e6e8" },
  { id: "owen", name: "Owen Brooks", initials: "OB", color: "#f2eedf" }
];

const contactById = new Map(contacts.map((contact) => [contact.id, contact]));
const elements = {
  layout: document.querySelector("#messaging-layout"),
  contactList: document.querySelector("#contact-list"),
  contactCount: document.querySelector("#contact-count"),
  contactSearch: document.querySelector("#contact-search"),
  conversationEmpty: document.querySelector("#conversation-empty"),
  activeConversation: document.querySelector("#active-conversation"),
  conversationPerson: document.querySelector("#conversation-person"),
  messageArea: document.querySelector("#message-area"),
  threadIntro: document.querySelector("#thread-intro"),
  messageList: document.querySelector("#message-list"),
  messageForm: document.querySelector("#message-form"),
  messageInput: document.querySelector("#message-input"),
  sendButton: document.querySelector("#send-button"),
  clearButton: document.querySelector("#clear-button"),
  backButton: document.querySelector("#back-button"),
  themeToggle: document.querySelector("#theme-toggle"),
  themeColorMeta: document.querySelector("#theme-color-meta"),
  storageNotice: document.querySelector("#storage-notice")
};

const state = loadState();
let mobileChatOpen = false;

applyTheme(loadTheme());
render();

elements.contactSearch.addEventListener("input", renderContacts);
elements.contactList.addEventListener("click", handleContactClick);
elements.messageInput.addEventListener("input", updateComposer);
elements.messageInput.addEventListener("keydown", handleComposerKeydown);
elements.messageForm.addEventListener("submit", handleSend);
elements.clearButton.addEventListener("click", clearConversation);
elements.backButton.addEventListener("click", showContacts);
elements.themeToggle.addEventListener("click", toggleTheme);
document.addEventListener("keydown", handleGlobalKeydown);

function loadTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    showStorageNotice("Browser storage is unavailable. Your theme choice may not be saved.");
    return "light";
  }
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  elements.themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
  elements.themeToggle.title = `Switch to ${isDark ? "light" : "dark"} theme`;
  elements.themeColorMeta.content = isDark ? "#171e1b" : "#f4f6f2";
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    showStorageNotice("Your theme changed, but couldn't be saved in this browser.");
  }
}

function createMessage(text, sender, minutesAgo) {
  return {
    id: `${sender}-${minutesAgo}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    sender,
    timestamp: new Date(Date.now() - minutesAgo * 60_000).toISOString()
  };
}

function createInitialState() {
  return {
    activeContactId: null,
    unreadCounts: {
      maya: 2,
      leo: 0,
      aisha: 1,
      ben: 0,
      nina: 0,
      owen: 0
    },
    conversations: {
      maya: [
        createMessage("Did you get a chance to see the little bookshop on King Street?", "received", 185),
        createMessage("I did! The upstairs reading nook is so cozy.", "sent", 171),
        createMessage("Right? We should make a slow Saturday of it sometime ☕", "received", 28)
      ],
      leo: [
        createMessage("The photos from the coast turned out better than I expected.", "received", 350),
        createMessage("Send them over when you get a minute — the sunset looked beautiful.", "sent", 331),
        createMessage("Just shared an album. The last one is my favorite.", "received", 49)
      ],
      aisha: [
        createMessage("I tried that lemon cake recipe you sent me.", "received", 92),
        createMessage("How did it turn out?", "sent", 77),
        createMessage("A little lopsided, but it tastes wonderful!", "received", 16)
      ],
      ben: [
        createMessage("Saturday's market starts early, apparently.", "received", 710),
        createMessage("Thanks for the heads up. I'll bring the tote bags.", "sent", 698)
      ],
      nina: [
        createMessage("I found a pottery class that looks right up your alley.", "received", 1420),
        createMessage("That sounds fun. Let's compare schedules this week.", "sent", 1385)
      ],
      owen: [
        createMessage("The garden is finally getting some sun again.", "received", 2810),
        createMessage("Your tomato plants must be very happy.", "sent", 2750)
      ]
    }
  };
}

function loadState() {
  const fallback = createInitialState();
  let serialized;

  try {
    serialized = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    showStorageNotice("Browser storage is unavailable. Changes may not be saved.");
    return fallback;
  }

  if (serialized === null) {
    return fallback;
  }

  let saved;
  try {
    saved = JSON.parse(serialized);
  } catch {
    showStorageNotice("Saved chat data couldn't be read. Demo conversations are shown instead.");
    return fallback;
  }

  if (!isRecord(saved) || saved.version !== 1) {
    showStorageNotice("Saved chat data has an unsupported format. Demo conversations are shown instead.");
    return fallback;
  }

  const conversations = {};
  const unreadCounts = {};
  let restoredWithFallbacks = false;

  for (const contact of contacts) {
    const savedMessages = saved.conversations?.[contact.id];
    if (Array.isArray(savedMessages) && savedMessages.every(isValidMessage)) {
      conversations[contact.id] = savedMessages;
    } else {
      conversations[contact.id] = fallback.conversations[contact.id];
      restoredWithFallbacks = true;
    }

    const unreadCount = saved.unreadCounts?.[contact.id];
    if (Number.isSafeInteger(unreadCount) && unreadCount >= 0) {
      unreadCounts[contact.id] = unreadCount;
    } else {
      unreadCounts[contact.id] = fallback.unreadCounts[contact.id];
      restoredWithFallbacks = true;
    }
  }

  const activeContactId = saved.activeContactId === null || contactById.has(saved.activeContactId)
    ? saved.activeContactId
    : null;
  if (saved.activeContactId !== null && activeContactId === null) {
    restoredWithFallbacks = true;
  }
  if (restoredWithFallbacks) {
    showStorageNotice("Some saved chat data couldn't be read. Demo data was restored where needed.");
  }

  return { activeContactId, conversations, unreadCounts };
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidMessage(message) {
  return isRecord(message)
    && typeof message.id === "string"
    && typeof message.text === "string"
    && message.text.length <= MAX_MESSAGE_LENGTH
    && (message.sender === "sent" || message.sender === "received")
    && typeof message.timestamp === "string"
    && Number.isFinite(Date.parse(message.timestamp));
}

function saveState() {
  const saved = {
    version: 1,
    activeContactId: state.activeContactId,
    unreadCounts: state.unreadCounts,
    conversations: state.conversations
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    hideStorageNotice();
  } catch {
    showStorageNotice("Your changes are visible, but couldn't be saved in this browser.");
  }
}

function showStorageNotice(message) {
  elements.storageNotice.textContent = message;
  elements.storageNotice.hidden = false;
}

function hideStorageNotice() {
  elements.storageNotice.textContent = "";
  elements.storageNotice.hidden = true;
}

function render() {
  renderContacts();
  renderConversation();
  elements.layout.classList.toggle("mobile-chat-open", mobileChatOpen && Boolean(state.activeContactId));
}

function renderContacts() {
  const query = elements.contactSearch.value.trim().toLocaleLowerCase();
  const visibleContacts = contacts.filter((contact) => contact.name.toLocaleLowerCase().includes(query));
  const fragment = document.createDocumentFragment();

  elements.contactCount.textContent = `${visibleContacts.length}`;

  if (visibleContacts.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "no-search-results";
    emptyItem.textContent = "No conversations match that name. Try another search.";
    fragment.append(emptyItem);
  }

  for (const contact of visibleContacts) {
    fragment.append(createContactItem(contact));
  }

  elements.contactList.replaceChildren(fragment);
}

function createContactItem(contact) {
  const latestMessage = getLatestMessage(contact.id);
  const unreadCount = state.unreadCounts[contact.id];
  const item = document.createElement("li");
  const button = document.createElement("button");
  const avatar = document.createElement("span");
  const copy = document.createElement("span");
  const topLine = document.createElement("span");
  const bottomLine = document.createElement("span");
  const name = document.createElement("span");
  const time = document.createElement("time");
  const preview = document.createElement("span");

  button.type = "button";
  button.className = "contact-item";
  button.dataset.contactId = contact.id;
  button.setAttribute("aria-current", state.activeContactId === contact.id ? "true" : "false");
  if (state.activeContactId === contact.id) {
    button.classList.add("is-active");
  }
  if (unreadCount > 0) {
    button.classList.add("has-unread");
  }

  avatar.className = "avatar avatar-small";
  avatar.textContent = contact.initials;
  avatar.style.backgroundColor = contact.color;

  copy.className = "contact-copy";
  topLine.className = "contact-topline";
  bottomLine.className = "contact-bottomline";
  name.className = "contact-name";
  name.textContent = contact.name;

  time.className = "contact-time";
  if (latestMessage) {
    time.dateTime = latestMessage.timestamp;
    time.textContent = formatTime(latestMessage.timestamp);
  }

  preview.className = "contact-preview";
  preview.textContent = latestMessage
    ? `${latestMessage.sender === "sent" ? "You: " : ""}${latestMessage.text}`
    : "No messages yet";

  topLine.append(name, time);
  bottomLine.append(preview);
  if (unreadCount > 0) {
    const badge = document.createElement("span");
    badge.className = "unread-badge";
    badge.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
    badge.setAttribute("aria-label", `${unreadCount} unread messages`);
    bottomLine.append(badge);
  }

  copy.append(topLine, bottomLine);
  button.append(avatar, copy);
  item.append(button);
  return item;
}

function renderConversation() {
  const contact = contactById.get(state.activeContactId);
  const hasContact = Boolean(contact);
  elements.conversationEmpty.hidden = hasContact;
  elements.activeConversation.hidden = !hasContact;
  elements.messageInput.disabled = !hasContact;
  elements.clearButton.disabled = !hasContact;
  elements.sendButton.disabled = !hasContact || elements.messageInput.value.trim().length === 0;

  if (!contact) {
    elements.conversationPerson.replaceChildren();
    elements.messageList.replaceChildren();
    elements.threadIntro.textContent = "";
    return;
  }

  renderConversationHeader(contact);
  renderMessages(contact);
}

function renderConversationHeader(contact) {
  const avatar = document.createElement("span");
  const details = document.createElement("span");
  const name = document.createElement("span");
  const note = document.createElement("p");

  avatar.className = "avatar";
  avatar.textContent = contact.initials;
  avatar.style.backgroundColor = contact.color;

  details.className = "person-details";
  name.className = "person-name";
  name.textContent = contact.name;
  note.className = "person-note";
  note.textContent = "Your personal conversation";
  details.append(name, note);
  elements.conversationPerson.replaceChildren(avatar, details);
}

function renderMessages(contact) {
  const messages = state.conversations[contact.id];
  const fragment = document.createDocumentFragment();
  const latestMessage = messages[messages.length - 1];

  elements.threadIntro.textContent = messages.length > 0
    ? `A little space to catch up with ${contact.name.split(" ")[0]}`
    : `A fresh start with ${contact.name.split(" ")[0]}`;

  if (messages.length === 0) {
    const empty = document.createElement("p");
    empty.className = "thread-empty";
    empty.textContent = "No messages here yet. Send a note to start the conversation.";
    fragment.append(empty);
  } else {
    for (const message of messages) {
      fragment.append(createMessageElement(message, contact));
    }
  }

  elements.messageList.replaceChildren(fragment);
  if (latestMessage) {
    elements.messageArea.scrollTop = elements.messageArea.scrollHeight;
  }
}

function createMessageElement(message, contact) {
  const row = document.createElement("div");
  const bubble = document.createElement("p");
  const time = document.createElement("time");

  row.className = `message-row ${message.sender === "sent" ? "is-sent" : "is-received"}`;
  bubble.className = "message-bubble";
  bubble.textContent = message.text;
  time.className = "message-time";
  time.dateTime = message.timestamp;
  time.textContent = formatTime(message.timestamp);
  row.setAttribute(
    "aria-label",
    `${message.sender === "sent" ? "You" : contact.name}, ${formatTime(message.timestamp)}`
  );
  row.append(bubble, time);
  return row;
}

function getLatestMessage(contactId) {
  const messages = state.conversations[contactId];
  return messages.length > 0 ? messages[messages.length - 1] : null;
}

function formatTime(timestamp) {
  return timeFormatter.format(new Date(timestamp));
}

function handleContactClick(event) {
  const button = event.target.closest("button[data-contact-id]");
  if (!button || !elements.contactList.contains(button)) {
    return;
  }

  const contactId = button.dataset.contactId;
  if (!contactById.has(contactId)) {
    return;
  }

  state.activeContactId = contactId;
  state.unreadCounts[contactId] = 0;
  mobileChatOpen = true;
  saveState();
  render();
}

function handleComposerKeydown(event) {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    elements.messageForm.requestSubmit();
  }
}

function handleGlobalKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
    event.preventDefault();
    elements.contactSearch.focus();
  }
}

function handleSend(event) {
  event.preventDefault();
  const contact = contactById.get(state.activeContactId);
  const text = elements.messageInput.value.trim();

  if (!contact || text.length === 0 || text.length > MAX_MESSAGE_LENGTH) {
    updateComposer();
    return;
  }

  state.conversations[contact.id].push({
    id: `sent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    sender: "sent",
    timestamp: new Date().toISOString()
  });
  elements.messageInput.value = "";
  resizeComposer();
  saveState();
  render();
  elements.messageInput.focus();
}

function updateComposer() {
  elements.sendButton.disabled = !state.activeContactId || elements.messageInput.value.trim().length === 0;
  resizeComposer();
}

function resizeComposer() {
  elements.messageInput.style.height = "auto";
  elements.messageInput.style.height = `${Math.min(elements.messageInput.scrollHeight, 150)}px`;
}

function clearConversation() {
  const contact = contactById.get(state.activeContactId);
  if (!contact) {
    return;
  }

  const confirmed = window.confirm(`Clear all messages with ${contact.name}? This can't be undone.`);
  if (!confirmed) {
    return;
  }

  state.conversations[contact.id] = [];
  state.unreadCounts[contact.id] = 0;
  saveState();
  render();
}

function showContacts() {
  mobileChatOpen = false;
  render();
}

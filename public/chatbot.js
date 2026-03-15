/**
 * Suricata IDS AI Chatbot Widget
 * A pure HTML/CSS/JS modular component.
 * To use, just include <script src="/chatbot.js"></script> in your dashboard.
 */

(function () {
  // --- CONFIGURATION ---
  const API_KEY = 'AIzaSyCjL2ueSVcCf9LJ3j_I92idtzkhY0-EtNA'; // Replace with your actual Gemini API Key
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  const SYSTEM_INSTRUCTION = "You are a cybersecurity AI assistant integrated into a Suricata Intrusion Detection System dashboard. You explain alerts, classify severity, suggest mitigation steps, and help security analysts understand threats. You never provide hacking instructions.";

  // --- STATE ---
  let isOpen = false;
  let isWaiting = false;
  let chatHistory = [];

  // --- INJECT CSS (Dark Mode / Neon Theme) ---
  const style = document.createElement('style');
  style.textContent = `
    #suricata-chatbot-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }

    @font-face {
      font-family: 'SuperMario';
      src: url('/fonts/SuperMario256.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }

    /* Floating Chat Icon */
    #suricata-chatbot-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: white;
      border: 2px solid black;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: black;
      font-family: 'SuperMario', sans-serif;
      font-size: 42px; /* Increased from 32px to 42px */
      text-shadow: 1px 1px 0 #fff;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      animation: chatbot-pulse 2s infinite;
      position: absolute;
      bottom: 0;
      right: 0;
      user-select: none;
    }

    #suricata-chatbot-icon:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
    }

    @keyframes chatbot-pulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
    }

    /* Chat Window */
    #suricata-chatbot-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 450px;
      background: var(--background, #0f172a);
      border: 1px solid var(--border, #1e293b);
      border-radius: var(--radius, 16px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease;
      transform-origin: bottom right;
    }

    #suricata-chatbot-window.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Header */
    #suricata-chatbot-header {
      background: var(--card, #1e293b);
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border, #334155);
    }

    #suricata-chatbot-header-title {
      color: var(--card-foreground, #f8fafc);
      font-weight: 600;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    #suricata-chatbot-header-title span {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: var(--chart-1, #00ffcc);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--chart-1, #00ffcc);
    }

    #suricata-chatbot-close {
      background: transparent;
      border: none;
      color: var(--muted-foreground, #94a3b8);
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      border-radius: var(--radius-sm, 4px);
      transition: color 0.2s;
    }

    #suricata-chatbot-close:hover {
      color: var(--foreground, #f8fafc);
    }

    /* Messages Area */
    #suricata-chatbot-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: thin;
      scrollbar-color: var(--border, #334155) transparent;
    }
    
    #suricata-chatbot-messages::-webkit-scrollbar {
      width: 6px;
    }
    #suricata-chatbot-messages::-webkit-scrollbar-thumb {
      background-color: var(--border, #334155);
      border-radius: 3px;
    }

    .chatbot-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: calc(var(--radius) - 2px);
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
      animation: chatbot-fade-in 0.3s ease;
    }
    
    @keyframes chatbot-fade-in {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .chatbot-msg.bot {
      align-self: flex-start;
      background: var(--card, #1e293b);
      color: var(--card-foreground, #e2e8f0);
      border-bottom-left-radius: 4px;
      border: 1px solid var(--border, #334155);
    }

    .chatbot-msg.user {
      align-self: flex-end;
      background: var(--primary, #00ffcc);
      color: var(--primary-foreground, #0f172a);
      border-bottom-right-radius: 4px;
      font-weight: 500;
    }

    /* Input Area */
    #suricata-chatbot-input-area {
      padding: 16px;
      border-top: 1px solid var(--border, #1e293b);
      display: flex;
      gap: 8px;
      background: var(--background, #0f172a);
    }

    #suricata-chatbot-input {
      flex: 1;
      background: var(--input, #1e293b);
      border: 1px solid var(--border, #334155);
      color: var(--foreground, #f8fafc);
      padding: 10px 14px;
      border-radius: var(--radius-md, 8px);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    #suricata-chatbot-input:focus {
      border-color: var(--ring, #00ffcc);
    }

    #suricata-chatbot-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    #suricata-chatbot-send {
      background: var(--primary, #00ffcc);
      color: var(--primary-foreground, #0f172a);
      border: none;
      border-radius: var(--radius-md, 8px);
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }

    #suricata-chatbot-send:hover:not(:disabled) {
      opacity: 0.9;
    }
    
    #suricata-chatbot-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    #suricata-chatbot-send svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    /* Typing Indicator */
    .chatbot-typing {
      display: flex;
      gap: 4px;
      padding: 14px 16px !important;
    }

    .chatbot-dot {
      width: 6px;
      height: 6px;
      background: var(--muted-foreground, #94a3b8);
      border-radius: 50%;
      animation: chatbot-bounce 1.4s infinite ease-in-out both;
    }

    .chatbot-dot:nth-child(1) { animation-delay: -0.32s; }
    .chatbot-dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes chatbot-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    
    /* Mobile Responsive */
    @media (max-width: 480px) {
      #suricata-chatbot-window {
        width: calc(100vw - 48px);
        height: 60vh;
        bottom: 80px;
      }
    }
  `;
  document.head.appendChild(style);

  // --- INJECT HTML ---
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'suricata-chatbot-widget';
  widgetContainer.innerHTML = `
    <div id="suricata-chatbot-window">
      <div id="suricata-chatbot-header">
        <div id="suricata-chatbot-header-title">
          <span></span> SOC Analyst AI
        </div>
        <button id="suricata-chatbot-close" title="Close chat">&times;</button>
      </div>
      <div id="suricata-chatbot-messages">
        <div class="chatbot-msg bot">Hello Analyst. How can I assist you with Suricata alerts today?</div>
      </div>
      <div id="suricata-chatbot-input-area">
        <input type="text" id="suricata-chatbot-input" placeholder="Ask about a threat..." autocomplete="off"/>
        <button id="suricata-chatbot-send" title="Send message">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
    <div id="suricata-chatbot-icon" title="Open AI Assistant">
      S
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // --- DOM ELEMENTS ---
  const icon = document.getElementById('suricata-chatbot-icon');
  const windowEl = document.getElementById('suricata-chatbot-window');
  const closeBtn = document.getElementById('suricata-chatbot-close');
  const inputEl = document.getElementById('suricata-chatbot-input');
  const sendBtn = document.getElementById('suricata-chatbot-send');
  const messagesEl = document.getElementById('suricata-chatbot-messages');

  // --- EVENT LISTENERS ---

  // Toggle chat window (Open)
  icon.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      windowEl.classList.add('open');
      inputEl.focus();
    } else {
      windowEl.classList.remove('open');
    }
  });

  // Close chat window
  closeBtn.addEventListener('click', () => {
    isOpen = false;
    windowEl.classList.remove('open');
  });

  // Keep chat window open when clicking inside it
  windowEl.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Handle Enter key for sending
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Handle send button click
  sendBtn.addEventListener('click', sendMessage);

  // --- FUNCTIONS ---

  function appendMessage(text, sender) {
    const msgEl = document.createElement('div');
    msgEl.className = `chatbot-msg ${sender}`;

    // Parse very basic markdown-like bold text for visual emphasis in chat (optional enhancement)
    const formattedText = text.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    msgEl.innerHTML = formattedText;

    messagesEl.appendChild(msgEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTypingIndicator() {
    const typingEl = document.createElement('div');
    typingEl.className = 'chatbot-msg bot chatbot-typing';
    typingEl.id = 'suricata-typing-indicator';
    typingEl.innerHTML = `
      <div class="chatbot-dot"></div>
      <div class="chatbot-dot"></div>
      <div class="chatbot-dot"></div>
    `;
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTypingIndicator() {
    const typingEl = document.getElementById('suricata-typing-indicator');
    if (typingEl) {
      typingEl.remove();
    }
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isWaiting) return;

    // Clear input and append user message
    inputEl.value = '';
    appendMessage(text, 'user');

    // Update state
    isWaiting = true;
    inputEl.disabled = true;
    sendBtn.disabled = true;

    // Add to chat history for Gemini context
    chatHistory.push({ role: 'user', parts: [{ text }] });

    showTypingIndicator();

    try {
      // Build request payload for Gemini API
      const payload = {
        contents: chatHistory,
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        }
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      removeTypingIndicator();

      if (data.error) {
        console.error("Gemini API Error:", data.error);
        appendMessage(`Error: ${data.error.message} `, 'bot');
        // Important: Pop the failed user message from history so context isn't corrupted
        chatHistory.pop();
      } else if (data.candidates && data.candidates.length > 0) {
        const botText = data.candidates[0].content.parts[0].text;
        appendMessage(botText, 'bot');
        // Save bot response to history
        chatHistory.push({ role: 'model', parts: [{ text: botText }] });
      } else {
        appendMessage("Sorry, I didn't get any response. Please check your API key.", 'bot');
        chatHistory.pop();
      }
    } catch (e) {
      console.error("Chatbot Network Error:", e);
      removeTypingIndicator();
      appendMessage("Network error. Could not connect to the AI.", 'bot');
      chatHistory.pop();
    } finally {
      isWaiting = false;
      inputEl.disabled = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }
})();

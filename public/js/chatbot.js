// Chatbot functionality
(function() {
    'use strict';
    
    console.log('Chatbot.js loaded');
    const API_URL = '/api';

    class Chatbot {
        constructor() {
            console.log('Chatbot constructor called');
            this.messages = [];
            this.isOpen = false;
            this.init();
        }

        init() {
            console.log('Chatbot init called');
            this.createChatbotWidget();
            this.attachEventListeners();
            this.addWelcomeMessage();
        }

    createChatbotWidget() {
        console.log('Creating chatbot widget...');
        const container = document.createElement('div');
        container.className = 'chatbot-container';
        container.innerHTML = `
            <button class="chatbot-button" id="chatbotToggle">
                💬
            </button>
            
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <h3>
                        <span class="chatbot-status"></span>
                        AI Buddy
                    </h3>
                    <button class="chatbot-close" id="chatbotClose">×</button>
                </div>
                
                <div class="chatbot-messages" id="chatbotMessages">
                    <!-- Messages will be inserted here -->
                </div>
                
                <div class="chatbot-input-area">
                    <input 
                        type="text" 
                        class="chatbot-input" 
                        id="chatbotInput" 
                        placeholder="Type your message..."
                        autocomplete="off"
                    >
                    <button class="chatbot-send" id="chatbotSend">
                        ➤
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        console.log('Chatbot widget appended to body');
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('chatbotToggle');
        const closeBtn = document.getElementById('chatbotClose');
        const sendBtn = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');

        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.closeChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbotWindow');
        window.classList.toggle('active');
        
        if (this.isOpen) {
            document.getElementById('chatbotInput').focus();
        }
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('chatbotWindow').classList.remove('active');
    }

    addWelcomeMessage() {
        const welcomeMsg = {
            text: "Hello! 👋 I'm your FAM assistant. I can help you find events, activities, caregivers, and answer questions about our community platform. How can I assist you today?",
            isBot: true,
            timestamp: new Date()
        };
        
        this.messages.push(welcomeMsg);
        this.displayMessage(welcomeMsg);
        this.showQuickReplies();
    }

    showQuickReplies() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const quickRepliesDiv = document.createElement('div');
        quickRepliesDiv.className = 'quick-replies';
        quickRepliesDiv.innerHTML = `
            <button class="quick-reply" onclick="chatbot.sendQuickReply('What events are available?')">
                📅 Events
            </button>
            <button class="quick-reply" onclick="chatbot.sendQuickReply('Show me health activities')">
                🏃 Health Activities
            </button>
            <button class="quick-reply" onclick="chatbot.sendQuickReply('Find caregivers')">
                👥 Caregivers
            </button>
            <button class="quick-reply" onclick="chatbot.sendQuickReply('What can you do?')">
                ❓ Help
            </button>
        `;
        
        messagesContainer.appendChild(quickRepliesDiv);
        this.scrollToBottom();
    }

    sendQuickReply(text) {
        document.getElementById('chatbotInput').value = text;
        this.sendMessage();
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        const userMsg = {
            text: message,
            isBot: false,
            timestamp: new Date()
        };
        
        this.messages.push(userMsg);
        this.displayMessage(userMsg);
        input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send message to backend
            const response = await fetch(`${API_URL}/chatbot/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                throw new Error('Failed to get response');
            }
            
            const data = await response.json();
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add bot response
            const botMsg = {
                text: data.message,
                isBot: true,
                timestamp: new Date(data.timestamp)
            };
            
            this.messages.push(botMsg);
            this.displayMessage(botMsg);
            
        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTypingIndicator();
            
            const errorMsg = {
                text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                isBot: true,
                timestamp: new Date()
            };
            
            this.messages.push(errorMsg);
            this.displayMessage(errorMsg);
        }
    }

    displayMessage(message) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.isBot ? 'message-bot' : 'message-user'}`;
        
        // Format message text (handle markdown-style formatting)
        let formattedText = message.text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\n/g, '<br>'); // Line breaks
        
        messageDiv.innerHTML = `
            ${formattedText}
            <span class="message-timestamp">
                ${this.formatTime(message.timestamp)}
            </span>
        `;
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingDiv = document.getElementById('typingIndicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }
}

// Initialize chatbot when DOM is ready
let chatbot;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chatbot...');
    try {
        chatbot = new Chatbot();
        console.log('Chatbot initialized successfully');
        
        // Make chatbot available globally
        window.chatbot = chatbot;
    } catch (error) {
        console.error('Error initializing chatbot:', error);
    }
});

})(); // End of IIFE

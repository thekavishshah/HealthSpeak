import { useState, useEffect, useRef } from 'react';
import './ChatPage.css';

const API_BASE_URL = 'http://localhost:3001';

function ChatPage({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch chat history on mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // For development: use mock data if no token
        setMessages([
          {
            id: 1,
            role: 'assistant',
            message: "Hello! I'm your HealthSpeak assistant. Ask me anything about medical terms, conditions, or health information.",
            created_at: new Date().toISOString()
          }
        ]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/history?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const data = await response.json();

      if (data.success && data.data) {
        setMessages(data.data.reverse()); // Reverse to show oldest first
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
      // Start with welcome message on error
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          message: "Hello! I'm your HealthSpeak assistant. Ask me anything about medical terms, conditions, or health information.",
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    // Add user message to UI immediately
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      message: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // For development: simulate AI response if no token
      if (!token) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        const aiMessage = {
          id: `temp-ai-${Date.now()}`,
          role: 'assistant',
          message: "I'm here to help! However, authentication is required for full functionality. Please note that I can provide general health information, but you should always consult with a healthcare professional for medical advice.",
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      if (data.success) {
        // Add AI response
        const aiMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          message: data.message,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button onClick={onBack} className="back-button" type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1 className="chat-title">Health Assistant</h1>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
          >
            <div className="message-content">
              <div className="message-text">{msg.message}</div>
              <div className="message-timestamp">
                {formatTimestamp(msg.created_at)}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message-assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask about medical terms, symptoms, or conditions..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={!inputMessage.trim() || loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>

      <div className="chat-disclaimer">
        This is an AI assistant. Always consult with healthcare professionals for medical advice.
      </div>
    </div>
  );
}

export default ChatPage;

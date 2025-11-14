import { useState } from 'react';
import './Sidebar.css';

function Sidebar() {
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'Previous search 1', timestamp: '2 hours ago' },
    { id: 2, title: 'Previous search 2', timestamp: 'Yesterday' },
    { id: 3, title: 'Previous search 3', timestamp: '2 days ago' },
  ]);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="new-chat-btn">+ New Chat</button>
      </div>

      <div className="chat-history">
        <h3>Chat History</h3>
        <div className="history-list">
          {chatHistory.map((chat) => (
            <div key={chat.id} className="history-item">
              <div className="history-title">{chat.title}</div>
              <div className="history-timestamp">{chat.timestamp}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

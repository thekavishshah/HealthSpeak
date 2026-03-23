import { useState } from 'react';
import './Sidebar.css';

function Sidebar({ onOpenNotes, onGoHome, sidebarHistoryRef, notesRef}) {
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'Previous search 1', timestamp: '2 hours ago' },
    { id: 2, title: 'Previous search 2', timestamp: 'Yesterday' },
    { id: 3, title: 'Previous search 3', timestamp: '2 days ago' },
  ]);


  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="home-btn" onClick={onGoHome}>
          Home
        </button>
        <button className="new-chat-button" onClick={onGoHome}>
          + New Chat
        </button>
      </div>

      <div className="chat-history" ref={sidebarHistoryRef}>
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
        <button ref={notesRef} className="new-chat-btn notes-btn" onClick={onOpenNotes}>
          Notes
        </button>
    </div>
  );
}

export default Sidebar;

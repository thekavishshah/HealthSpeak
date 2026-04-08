import './Sidebar.css';

function Sidebar({
  onOpenNotes,
  onGoHome,
  sidebarHistoryRef,
  notesRef,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onSearchTerm,
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="home-btn" onClick={onGoHome}>
          Home
        </button>

        <button className="new-chat-button" onClick={onNewChat}>
          + New Chat
        </button>
      </div>

      <div className="chat-history" ref={sidebarHistoryRef}>
        <h3>Chat History</h3>

        <div className="history-list">
          {sessions.length === 0 ? (
            <div className="history-empty">No chats yet</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`history-item ${
                  activeSessionId === session.id ? "active" : ""
                }`}
                onClick={() => onSelectSession(session)}
              >
                <div className="history-title">{session.title}</div>

                <div className="history-terms">
                  {session.terms.map((term, index) => (
                    <button
                      key={`${session.id}-${index}`}
                      type="button"
                      className="history-term-chip"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSession(session);
                        onSearchTerm(term);
                      }}
                    >
                      {term}
                    </button>
                  ))}
                </div>

                <div className="history-timestamp">{session.timestamp}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        ref={notesRef}
        className="new-chat-btn notes-btn"
        onClick={onOpenNotes}
      >
        Notes
      </button>
    </div>
  );
}

export default Sidebar;
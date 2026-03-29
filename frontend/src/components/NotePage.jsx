import { useEffect, useState } from "react";
import "./NotePage.css";
import { getSavedEntries, addManualNote, deleteEntry, updateEntry } from "./noteStorage";

function NotePage({ onBack }) {
  const [entries, setEntries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const saved = getSavedEntries();
    setEntries(saved);
    if (saved.length > 0) {
      setSelectedId(saved[0].id);
    }
  }, []);

  const selectedEntry = entries.find((entry) => entry.id === selectedId);

  const handleSaveManualNote = () => {
    if (!noteText.trim()) return;

    const updated = addManualNote(noteTitle, noteText);
    setEntries(updated);
    setSelectedId(updated[0].id);
    setNoteTitle("");
    setNoteText("");
    setSavedMessage("Note saved!");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const handleDelete = (id) => {
    const updated = deleteEntry(id);
    setEntries(updated);

    if (selectedId === id) {
      setSelectedId(updated[0]?.id || null);
    }
  };

  const handleStartEdit = () => {
  if (!selectedEntry || selectedEntry.type !== "manual") return;

  setEditTitle(selectedEntry.title || "");
  setEditContent(selectedEntry.content || "");
  setIsEditing(true);
};

const handleSaveEdit = () => {
  if (!selectedEntry) return;

  const updated = updateEntry(selectedEntry.id, {
    title: editTitle.trim() || "Untitled note",
    content: editContent.trim(),
  });

  setEntries(updated);
  setIsEditing(false);
  setSavedMessage("Note updated!");
  setTimeout(() => setSavedMessage(""), 2000);
};

const handleCancelEdit = () => {
  setIsEditing(false);
  setEditTitle("");
  setEditContent("");
};

  return (
    <div className="notes-page">
      <div className="notes-header">
        <div>
          <h1 className="notes-title">Your Notes</h1>
          <p className="notes-subtitle">Saved terms and personal notes in one place.</p>
        </div>

        <button className="back-pill-btn" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="notes-layout">
        <aside className="notes-sidebar">
          <h2 className="notes-section-heading">Saved Entries</h2>

          <div className="notes-entry-list">
            {entries.length === 0 ? (
              <p className="empty-state">No saved entries yet.</p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`notes-entry-card ${selectedId === entry.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedId(entry.id);
                    setIsEditing(false);
                  }}
                >
                  <div className="notes-entry-top">
                    <span className={`entry-badge ${entry.type}`}>
                      {entry.type === "favorite" ? "★ Saved Term" : "Note"}
                    </span>

                    <button
                      className="entry-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const confirmed = window.confirm("Are you sure you want to delete this note?");
                          if (confirmed) {
                            handleDelete(entry.id);
                          }
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <h3>{entry.title}</h3>
                  <p>
                  {entry.content
                    ? entry.content.length > 80
                      ? `${entry.content.slice(0, 80)}...`
                      : entry.content
                    : "No preview available."}
                </p>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="notes-detail-panel">
          <div className="notes-detail-card">
            {selectedEntry ? (
              <>
                <div className="detail-header-row">
                  <span className={`entry-badge ${selectedEntry.type}`}>
                    {selectedEntry.type === "favorite" ? "★ Favorited Term" : "Selected Note"}
                  </span>

                  {selectedEntry.type === "manual" && !isEditing && (
                    <button className="edit-note-btn" onClick={handleStartEdit}>
                      Edit
                    </button>
                  )}
                </div>

                {isEditing && selectedEntry.type === "manual" ? (
                  <div className="edit-note-form">
                    <input
                      className="note-title-input"
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Note title"
                    />

                    <textarea
                      className="notes-textarea"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Edit your note..."
                    />

                    <div className="edit-actions">
                      <button className="save-btn" onClick={handleSaveEdit}>
                        Save Changes
                      </button>
                      <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2>{selectedEntry.title}</h2>
                    <p className="entry-date">
                      {new Date(selectedEntry.createdAt).toLocaleString()}
                    </p>

                    <div className="entry-content">
                      <p>{selectedEntry.content}</p>

                  {selectedEntry.symptoms?.length > 0 && (
                    <>
                      <h4>Symptoms</h4>
                      <ul>
                        {selectedEntry.symptoms.map((symptom, index) => (
                          <li key={index}>{symptom}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {selectedEntry.causes?.length > 0 && (
                    <>
                      <h4>Possible Causes</h4>
                      <ul>
                        {selectedEntry.causes.map((cause, index) => (
                          <li key={index}>{cause}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </>
              )}
              </>
            ) : (
              <p className="empty-state">Select an entry to view it.</p>
            )}
          </div>

          <div className="manual-note-composer">
            <h3>Add a Personal Note</h3>

            <input
              className="note-title-input"
              type="text"
              placeholder="Note title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />

            <textarea
              className="notes-textarea"
              placeholder="Write your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />

            <button className="save-btn" onClick={handleSaveManualNote}>
              Save Note
            </button>

            {savedMessage && <p className="saved-message">{savedMessage}</p>}
          </div>
        </main>
      </div>
    </div>
  );
}

export default NotePage;
import { useEffect, useState } from "react";
import "./NotePage.css";

function Notes({ onBack }) {
  const [noteText, setNoteText] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const savedNotes = localStorage.getItem("healthspeak_notes");
    if (savedNotes) {
      setNoteText(savedNotes);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("healthspeak_notes", noteText);
    setSavedMessage("Notes saved!");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const handleClear = () => {
    setNoteText("");
    localStorage.removeItem("healthspeak_notes");
    setSavedMessage("Notes cleared.");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  return (
    <div className="notes-page">
      <h1 className="notes-title">Your Notes</h1>
      <p className="notes-subtitle">
        Write down anything you'd like to remember.
      </p>

      <textarea
        className="notes-textarea"
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Type your notes here..."
      />

      <div className="notes-buttons">
        <button className="save-btn" onClick={handleSave}>
            Save Notes
        </button>

        <button className="clear-btn" onClick={handleClear}>
            Clear
        </button>

        <button className="clear-btn" onClick={onBack}>
            Back
        </button>
        </div>

      {savedMessage && <p className="saved-message">{savedMessage}</p>}
    </div>
  );
}

export default Notes;
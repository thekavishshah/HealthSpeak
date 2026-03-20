import { useTheme } from "../context/ThemeContext.jsx";
import "./SettingsBar.css";

function SettingsModal({ onClose, onLogout, onReplayTutorial }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div
        className="settings-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </header>

        <section className="settings-section">
          <h3>Appearance</h3>

          <div className="theme-options">
            <button
              className={theme === "light" ? "active" : ""}
              onClick={() => setTheme("light")}
            >
              Light
            </button>

            <button
              className={theme === "dark" ? "active" : ""}
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>
          </div>
          <button className="replay-tutorial-button"
          onClick={() => {
            console.log("Replay clicked");
            onReplayTutorial();
          }}
          >
          Replay Tutorial
          </button>
          <button className="logout-button" onClick={onLogout}>
            Log Out
          </button>
        </section>
      </div>
    </div>
  );
}

export default SettingsModal;

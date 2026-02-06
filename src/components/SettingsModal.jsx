import { useTheme } from "../context/ThemeContext.jsx";
import { useTheme } from "./ThemeContext";
import "./SettingsModal.css";

function SettingsModal({ onClose }) {
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
        </section>
      </div>
    </div>
  );
}

export default SettingsModal;

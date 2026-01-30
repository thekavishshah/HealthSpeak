import "./SettingsButton.css";

function SettingsButton({ onClick }) {
  return (
    <button
      className="settings-button"
      onClick={onClick}
      aria-label="Open settings"
    >
      ⚙️
    </button>
  );
}

export default SettingsButton;
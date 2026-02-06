import { useState } from "react";
import SettingsButton from "./SettingsButton"; 
import SettingsModal from "./SettingsModal";
//import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import "./Login.css";

function Login({ onLogin, onSwitchToSignup, onSwitchToRecover, onSwitchBackToHome}) {
  const [patientId, setPatientId] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const {showSettings, setShowSettings} = useSettings();
  //const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!patientId || !dob) {
      setError("Please enter your Patient ID and Date of Birth.");
      return;
    }

    // Prototype-only validation
    if (patientId === "HS-12345" && dob === "2000-05-04") {
      onLogin(); // Go to App.tsx
    } else {
      setError("Invalid Patient ID or Date of Birth.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-card">
          <SettingsButton onClick={() => setShowSettings(true)} />
          <div className="auth-header">
            <h1 className="auth-logo">HealthSpeak</h1>
            <p className="auth-subtitle">
              Welcome back! Login for a more personalized experience.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label className="form-label">Patient ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-button">
              Sign In
            </button>

            <div className="button-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="auth-button secondary"
              onClick={onLogin}
            >
              Continue to App
            </button>
            <button
              type="button"
              className="auth-button secondary"
              onClick={onSwitchBackToHome}
            >
              Back to Home
            </button>
          </form>

          <div className="auth-footer">
            <p>
              New patient?{" "}
              <button
                className="link-button-bold"
                onClick={onSwitchToSignup}
              >
                Create Account
              </button>
            </p>
            <p>
              Forgot PatientId?{" "}
              <button 
                className = "link-button-bold"
                onClick = {onSwitchToRecover}>
                Recover Id
              </button>
            </p>
          </div>
        </div>
          {showSettings && (
            <SettingsModal onClose={() => setShowSettings(false)} />
          )}
      </div>
    </div>
  );
}

export default Login;

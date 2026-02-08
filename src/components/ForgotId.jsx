import { useState } from 'react';
import './Login.css';
import SettingsButton from "./SettingsButton"; 
import SettingsModal from "./SettingsModal";
import { useSettings } from "../context/SettingsContext";

function ForgotId({ onSwitchToLogin}) {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [error, setError] = useState('');
  const {showSettings, setShowSettings} = useSettings();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    let emailChecker =  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Validation
    if (!formData.email) {
      setError('Please enter your email to proceed further');
      return;
    }

    if (!emailChecker.test(formData.email.trim())) {
        setError("Please enter a valid email address!");
        return;
    }
    /*
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
      */

    // For demo purposes, accept registration
    console.log('Recovering patient id for the email:', formData.email);
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-card signup-card">
          <SettingsButton onClick={() => setShowSettings(true)} />
          <div className="auth-header">
            <h1 className="auth-logo">HealthSpeak</h1>
            <p className="auth-subtitle">Please enter your email below to recover Patient ID.</p>
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

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="auth-button">
              Recover ID
            </button>
          </form>
          <div class="auth-footer">
              <p>
                Back To Sign-in{" "}
                <button className = "link-button-bold" onClick = {onSwitchToLogin}>
                  Sign-in
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

export default ForgotId;
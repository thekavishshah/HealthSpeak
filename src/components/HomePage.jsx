import './HomePage.css';
import { useState } from "react";
import { useSettings } from "../context/SettingsContext";
import SettingsButton from "./SettingsButton"; 
import SettingsModal from "./SettingsModal";
function HomePage({onSwitchToLogin}) {
    const {showSettings, setShowSettings} = useSettings();
    return (
        <>
        <div className="auth-container">
            <SettingsButton onClick={() => setShowSettings(true)} />
            <div className="header-container">
                <h1 className="auth-title">HealthSpeak</h1>
                <h1>Query health terms. Get clear answers</h1>
                <h2>From a simple definition to identifying symptoms and potential causes </h2>
            </div>
            <div className="card-benefit-row">
                <div className="card-benefit">
                    <h2>Clear, Simplified Medical Terms</h2>
                    <p>Search medical terms and diagnoses explained in clear, accessible language</p>
                </div>
                <div className="card-benefit">
                    <h2>Understand Different Symptoms</h2>
                    <p>Each search includes associated symptoms and potential causes to provide context</p>
                </div>
                <div className="card-benefit">
                    <h2>Cross-Referenced Concepts</h2>
                    <p>Each search includes associated symptoms and potential causes to provide context</p>
                </div>
            </div>
            <button className="auth-next" onClick={onSwitchToLogin}>Sign-in</button>
            {showSettings && (
            <SettingsModal onClose={() => setShowSettings(false)} />
          )}
        </div>
        </>
    )
}
export default HomePage;
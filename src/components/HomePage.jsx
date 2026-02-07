import './HomePage.css';
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
                    <h2 className="benefit-title">Clear, Simplified Medical Terms</h2>
                    <p className="benefit-description">Search medical terms and diagnoses explained in clear, accessible language</p>
                </div>
                <div className="card-benefit">
                    <h2 className="benefit-title">Understand Different Symptoms</h2>
                    <p className="benefit-description">Each search includes associated symptoms and potential causes to provide context</p>
                </div>
                <div className="card-benefit">
                    <h2 className="benefit-title">Cross-Referenced Concepts</h2>
                    <p lassName="benefit-description">Each search includes associated symptoms and potential causes to provide context</p>
                </div>
            </div>
            <div className="app-work">
                <h2>How it works: </h2>
                <div class="step-list">
                    <div class="step">
                        <div class="Circle">1</div>
                        <p>Sign in using the  button below</p>
                    </div>
                    <div class="step">
                        <div class="Circle">2</div>
                        <p>Search up the term using search bar on main page</p>
                    </div>
                    <div class="step">
                        <div class="Circle">3</div>
                        <p>Explore clear definitions, symptoms, and related terms with helpful context</p>
                    </div>
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
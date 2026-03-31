import { useEffect, useState, useRef } from 'react'
import './App.css'
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import ResultsPage from './components/ResultsPage';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ForgotId from './components/ForgotId.jsx';
import HomePage from './components/HomePage.jsx';
import SettingsButton from "./components/SettingsButton"; 
import SettingsModal from "./components/SettingsBar.jsx";
import {useSettings} from "./context/SettingsContext";
import NotePage from "./components/NotePage.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Change this to true to enter main Health Speak app - bypass authentication
  const [authView, setAuthView] = useState('home') // 'login' or 'signup'
  const [currentView, setCurrentView] = useState('landing') // 'landing' or 'results'
  const [searchTerm, setSearchTerm] = useState('')
  //const [showSettings, setShowSettings] = useState(false);  //settings button
  const {showSettings, setShowSettings} = useSettings();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialRunId, setTutorialRunId] = useState(0);
  const sidebarHistoryRef = useRef(null);
  const notesRef = useRef(null);
  const logoutButtonRef = useRef(null);

  const handleOpenNotes = () => {
    setCurrentView('notes');
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleSignUp = () => {
    setIsAuthenticated(true)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setCurrentView('results')
  }

  const handleBackToHome = () => {
    setCurrentView('landing')
    setSearchTerm('')
  }

  const handleLogout = () => {
    //console.log("LOGOUT TRIGGERED");
    setIsAuthenticated(false);
    setAuthView("login");    
    setCurrentView("landing");
    setSearchTerm("");
};

useEffect(() => {
  const seenTutorial = localStorage.getItem("seenLandingTutorial");
  if (!seenTutorial) {
    setShowTutorial(true);
  }
}, []);

const handleCloseTutorial = () => {
  localStorage.setItem("seenLandingTutorial", "true");
  setShowTutorial(false);
};

const handleReplayTutorial = () => {
  localStorage.removeItem("seenLandingTutorial");
  setShowSettings(false);
  setCurrentView("landing");
  setShowTutorial(true);
  setTutorialRunId((prev) => prev + 1);
};

  // If not authenticated, show login or signup
  if (!isAuthenticated) {
    if(authView =='home') {
      return <HomePage  onSwitchToLogin={() => setAuthView('login')} />
    }
    else if (authView === 'login') {
      return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} onSwitchToRecover={() => setAuthView('recover')} onSwitchBackToHome={() => setAuthView('home')} />
    } else if (authView === 'recover') {
      return <ForgotId onSwitchToLogin = {() => setAuthView('login')} />

    }
    else {
      return <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setAuthView('login')} />
    }
  }

  // If authenticated, show main app
  return (
    <>
    <div className="app">
      <Sidebar
        onOpenNotes={handleOpenNotes}
        onGoHome={handleBackToHome}
        sidebarHistoryRef={sidebarHistoryRef}
        notesRef={notesRef}
        //logoutButtonRef={logoutButtonRef}
      />
      {/* Settings icon: visible on all pages*/}
      <SettingsButton onClick={() => setShowSettings(true)} />

      {currentView === 'landing' && (
        <LandingPage
        onSearch={handleSearch}
        onOpenNotes={handleOpenNotes}
        showTutorial={showTutorial}
        onCloseTutorial={handleCloseTutorial}
        tutorialRunId={tutorialRunId}
        sidebarHistoryRef={sidebarHistoryRef}
      />
      )}

      {currentView === 'results' && (
        <ResultsPage
          searchTerm={searchTerm}
          onNewSearch={handleSearch}
          onBack={handleBackToHome}
        />
      )}

      {currentView === 'notes' && (
        <NotePage onBack={handleBackToHome} />
      )}
    </div>

    {/* Settings panel (overlay) */}
    {showSettings && (
    <SettingsModal
      onClose={() => setShowSettings(false)}
      onLogout={handleLogout}
      onReplayTutorial={handleReplayTutorial}
    />
    )}
    </>
  );
}


export default App;

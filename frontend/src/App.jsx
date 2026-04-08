import { useEffect, useState, useRef } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import ResultsPage from './components/ResultsPage';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ForgotId from './components/ForgotId.jsx';
import HomePage from './components/HomePage.jsx';
import SettingsButton from "./components/SettingsButton";
import SettingsModal from "./components/SettingsBar.jsx";
import { useSettings } from "./context/SettingsContext";
import NotePage from "./components/NotePage.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('home');
  const [currentView, setCurrentView] = useState('landing');
  const [searchTerm, setSearchTerm] = useState('');
  const { showSettings, setShowSettings } = useSettings();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialRunId, setTutorialRunId] = useState(0);

  const sidebarHistoryRef = useRef(null);
  const notesRef = useRef(null);
  const logoutButtonRef = useRef(null);

  const [chatSessions, setChatSessions] = useState(() => {
    const saved = localStorage.getItem("healthspeak_chat_sessions");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = localStorage.getItem("healthspeak_active_session");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem(
      "healthspeak_chat_sessions",
      JSON.stringify(chatSessions)
    );
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem(
      "healthspeak_active_session",
      JSON.stringify(activeSessionId)
    );
  }, [activeSessionId]);

  useEffect(() => {
    const seenTutorial = localStorage.getItem("seenLandingTutorial");
    if (!seenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const formatTimestamp = () =>
    new Date().toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const handleOpenNotes = () => {
    setCurrentView('notes');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView("login");
    setCurrentView("landing");
    setSearchTerm("");
    setActiveSessionId(null);
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
    setSearchTerm('');
  };

  const createNewSession = () => {
    const newSession = {
      id: Date.now(),
      title: "New Chat",
      terms: [],
      timestamp: formatTimestamp(),
    };

    setChatSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setCurrentView("landing");
    setSearchTerm("");
    return newSession.id;
  };

  const handleSearchWithHistory = (term) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    setChatSessions((prev) => {
      let sessions = [...prev];
      let sessionId = activeSessionId;

      if (!sessionId || !sessions.some((s) => s.id === sessionId)) {
        sessionId = Date.now();

        const newSession = {
          id: sessionId,
          title: cleanTerm,
          terms: [cleanTerm],
          timestamp: formatTimestamp(),
        };

        setActiveSessionId(sessionId);
        return [newSession, ...sessions];
      }

      const updatedSessions = sessions.map((session) => {
        if (session.id !== sessionId) return session;

        const alreadyExists = session.terms.some(
          (savedTerm) => savedTerm.toLowerCase() === cleanTerm.toLowerCase()
        );

        const updatedTerms = alreadyExists
          ? session.terms
          : [...session.terms, cleanTerm];

        return {
          ...session,
          title: session.title === "New Chat" ? cleanTerm : session.title,
          terms: updatedTerms,
          timestamp: formatTimestamp(),
        };
      });

      const activeSession = updatedSessions.find((s) => s.id === sessionId);
      const rest = updatedSessions.filter((s) => s.id !== sessionId);

      return activeSession ? [activeSession, ...rest] : updatedSessions;
    });

    setSearchTerm(cleanTerm);
    setCurrentView("results");
  };

  const handleSelectSession = (session) => {
    setActiveSessionId(session.id);

    if (session.terms.length > 0) {
      const latestTerm = session.terms[session.terms.length - 1];
      setSearchTerm(latestTerm);
      setCurrentView("results");
    } else {
      setSearchTerm("");
      setCurrentView("landing");
    }
  };

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

  if (!isAuthenticated) {
    if (authView === 'home') {
      return <HomePage onSwitchToLogin={() => setAuthView('login')} />;
    } else if (authView === 'login') {
      return (
        <Login
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthView('signup')}
          onSwitchToRecover={() => setAuthView('recover')}
          onSwitchBackToHome={() => setAuthView('home')}
        />
      );
    } else if (authView === 'recover') {
      return <ForgotId onSwitchToLogin={() => setAuthView('login')} />;
    } else {
      return (
        <SignUp
          onSignUp={handleSignUp}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  return (
    <>
      <div className="app">
        <Sidebar
          onOpenNotes={handleOpenNotes}
          onGoHome={handleBackToHome}
          sidebarHistoryRef={sidebarHistoryRef}
          notesRef={notesRef}
          sessions={chatSessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={createNewSession}
          onSearchTerm={handleSearchWithHistory}
        />

        <SettingsButton onClick={() => setShowSettings(true)} />

        {currentView === 'landing' && (
          <LandingPage
            onSearch={handleSearchWithHistory}
            onOpenNotes={handleOpenNotes}
            showTutorial={showTutorial}
            onCloseTutorial={handleCloseTutorial}
            tutorialRunId={tutorialRunId}
            sidebarHistoryRef={sidebarHistoryRef}
            logoutButtonRef={logoutButtonRef}
          />
        )}

        {currentView === 'results' && (
          <ResultsPage
            searchTerm={searchTerm}
            onNewSearch={handleSearchWithHistory}
            onBack={handleBackToHome}
          />
        )}

        {currentView === 'notes' && (
          <NotePage onBack={handleBackToHome} />
        )}
      </div>

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
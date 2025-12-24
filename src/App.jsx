import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import LandingPage from './components/LandingPage'
import ResultsPage from './components/ResultsPage'
import Login from './components/Login'
import SignUp from './components/SignUp'
import SettingsButton from "./components/SettingsButton"; 
import SettingsModal from "./components/SettingsModal";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Change this to true to enter main Health Speak app - bypass authentication
  const [authView, setAuthView] = useState('login') // 'login' or 'signup'
  const [currentView, setCurrentView] = useState('landing') // 'landing' or 'results'
  const [searchTerm, setSearchTerm] = useState('')
  const [showSettings, setShowSettings] = useState(false);  //settings button

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

  // If not authenticated, show login or signup
  if (!isAuthenticated) {
    if (authView === 'login') {
      return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} />
    } else {
      return <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setAuthView('login')} />
    }
  }

  // If authenticated, show main app
  return (
    <>
    <div className="app">
      <Sidebar />
      {/* Settings icon: visible on all pages*/}
      <SettingsButton onClick={() => setShowSettings(true)} />

      {currentView === 'landing' ? (
        <LandingPage
          onSearch={handleSearch}
          onLogout={handleLogout}
        />

      ) : (

        <ResultsPage 
        searchTerm={searchTerm} 
        onNewSearch={handleSearch} 
        onBack={handleBackToHome} />     
      )}
    </div>

    {/* Settings panel (overlay) */}
    {showSettings && (
    <SettingsModal onClose={() => setShowSettings(false)} />
    )}
    </>
  );
}


export default App;

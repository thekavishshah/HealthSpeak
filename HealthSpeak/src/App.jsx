import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import LandingPage from './components/LandingPage'
import ResultsPage from './components/ResultsPage'
import Login from './components/Login'
import SignUp from './components/SignUp'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authView, setAuthView] = useState('login') // 'login' or 'signup'
  const [currentView, setCurrentView] = useState('landing') // 'landing' or 'results'
  const [searchTerm, setSearchTerm] = useState('')

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
    <div className="app">
      <Sidebar />
      {currentView === 'landing' ? (
        <LandingPage onSearch={handleSearch} />
      ) : (
        <ResultsPage searchTerm={searchTerm} onNewSearch={handleSearch} onBack={handleBackToHome} />
      )}
    </div>
  )
}

export default App

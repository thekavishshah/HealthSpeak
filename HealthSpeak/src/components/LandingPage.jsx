import { useState } from 'react';
import './LandingPage.css';

function LandingPage({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleQuickLinkClick = (term) => {
    onSearch(term);
  };

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="app-title">HealthSpeak</h1>
        <p className="app-subtitle">
          Bridging the communication gap between patients and healthcare providers
        </p>

        <form onSubmit={handleSearch} className="search-container">
          <div className="search-box">
            <svg
              className="search-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search medical terms, symptoms, or conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        <div className="quick-links">
          <p className="quick-links-title">Popular searches:</p>
          <div className="quick-link-buttons">
            <button className="quick-link" onClick={() => handleQuickLinkClick('Hypertension')}>Hypertension</button>
            <button className="quick-link" onClick={() => handleQuickLinkClick('Diabetes')}>Diabetes</button>
            <button className="quick-link" onClick={() => handleQuickLinkClick('Common Cold')}>Common Cold</button>
            <button className="quick-link" onClick={() => handleQuickLinkClick('Migraine')}>Migraine</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

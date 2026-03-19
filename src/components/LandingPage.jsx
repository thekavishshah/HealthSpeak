import {useMemo, useRef, useState } from 'react';
import './LandingPage.css';
import TutorialOverlay from "./TutorialOverlay";

function LandingPage({
  onSearch,
  onLogout,
  showTutorial,
  onCloseTutorial,
  tutorialRunId,
  sidebarHistoryRef = null,
  logoutButtonRef = null}) {

  const [searchQuery, setSearchQuery] = useState('');
  const searchBoxRef = useRef(null);
  const searchButtonRef = useRef(null);
  const quickLinksRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleQuickLinkClick = (term) => {
    onSearch(term);
  };


  const tutorialSteps = useMemo(() => {
    const steps = [
      {
        targetRef: searchBoxRef,
        title: "Search here",
        text: "Type a medical term, symptom, or condition here to begin.",
        placement: "bottom",
      },
      {
        targetRef: searchButtonRef,
        title: "Start your search",
        text: "Click Search after entering your term.",
        placement: "bottom",
      },
      {
        targetRef: quickLinksRef,
        title: "Popular searches",
        text: "These quick buttons help users try common terms right away.",
        placement: "top",
      },
    ];

    if (sidebarHistoryRef) {
      steps.push({
        targetRef: sidebarHistoryRef,
        title: "Chat history",
        text: "Past searches or chats can be revisited here.",
        placement: "right",
      });
    }

    if (logoutButtonRef) {
      steps.push({
        targetRef: logoutButtonRef,
        title: "Logout",
        text: "Use this button to safely sign out.",
        placement: "left",
      });
    }

    return steps;
  }, [sidebarHistoryRef, logoutButtonRef]);

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="app-title">HealthSpeak</h1>
        <p className="app-subtitle">
          Bridging the communication gap between patients and healthcare providers
        </p>

        <form onSubmit={handleSearch} className="search-container">
          <div className="search-box" ref={searchBoxRef}>
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

          <button
            type="submit"
            className="search-button"
            ref={searchButtonRef}
          >
            Search
          </button>
        </form>

        <div className="quick-links" ref={quickLinksRef}>
          <p className="quick-links-title">Popular searches:</p>
          <div className="quick-link-buttons">
            <button type="button" className="quick-link" onClick={() => handleQuickLinkClick('Hypertension')}>
              Hypertension
            </button>
            <button type="button" className="quick-link" onClick={() => handleQuickLinkClick('Diabetes')}>
              Diabetes
            </button>
            <button type="button" className="quick-link" onClick={() => handleQuickLinkClick('Common Cold')}>
              Common Cold
            </button>
            <button type="button" className="quick-link" onClick={() => handleQuickLinkClick('Migraine')}>
              Migraine
            </button>
          </div>
        </div>
      </div>

      {showTutorial && tutorialSteps.length > 0 && (
        <TutorialOverlay
          key={tutorialRunId}
          steps={tutorialSteps}
          onClose={onCloseTutorial}
        />
      )}
    </div>
  );
}

export default LandingPage;
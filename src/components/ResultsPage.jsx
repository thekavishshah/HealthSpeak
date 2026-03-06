import { useState, useEffect } from 'react';
import './ResultsPage.css';

const API_BASE_URL = 'http://localhost:3001';

function ResultsPage({ searchTerm, onNewSearch, onBack }) {
  const [query, setQuery] = useState(searchTerm);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch medical term data from backend
  useEffect(() => {
    const fetchMedicalTerm = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ term: searchTerm }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch medical information');
        }

        const data = await response.json();

        if (data.success && data.data) {
          setResultData(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching medical term:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm) {
      fetchMedicalTerm();
    }
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    onNewSearch(query);
  };

  return (
    <div className="results-page">
      <div className="search-bar-compact">
        <button onClick={onBack} className="back-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <form onSubmit={handleSearch} className="search-form-compact">
          <div className="search-box-compact">
            <svg
              className="search-icon-compact"
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
              className="search-input-compact"
              placeholder="Search medical terms..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      <div className="results-content">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Analyzing medical term with AI...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <h2>Unable to Load Information</h2>
            <p>{error}</p>
            <p>Please make sure the backend server is running on port 3001.</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && resultData && (
          <>
        <div className="term-header">
          <h1 className="term-title">{resultData.term}</h1>
          <button className="speak-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            Listen
          </button>
        </div>

        <section className="info-section">
          <h2 className="section-title">What is it?</h2>
          <p className="section-text">{resultData.definition}</p>
        </section>

        <section className="info-section">
          <h2 className="section-title">Common Symptoms</h2>
          <div className="symptom-grid">
            {resultData.symptoms.map((symptom, index) => (
              <div key={index} className="symptom-card">
                <div className="symptom-icon">•</div>
                <span>{symptom}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="info-section">
          <h2 className="section-title">Possible Causes</h2>
          <ul className="causes-list">
            {resultData.causes.map((cause, index) => (
              <li key={index} className="cause-item">{cause}</li>
            ))}
          </ul>
        </section>

        <section className="info-section">
          <h2 className="section-title">Related Terms</h2>
          <div className="related-terms">
            {resultData.relatedTerms.map((term, index) => (
              <button key={index} className="related-term-button">
                {term}
              </button>
            ))}
          </div>
        </section>

        <div className="disclaimer">
          <strong>Important:</strong> This information is for educational purposes only
          and should not replace professional medical advice. Always consult with a
          healthcare provider for accurate diagnosis and treatment.
        </div>
        </>
        )}
      </div>
    </div>
  );
}

export default ResultsPage;

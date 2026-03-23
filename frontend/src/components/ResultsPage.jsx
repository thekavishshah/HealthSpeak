import { useState, useEffect } from 'react';
import './ResultsPage.css';
import { addFavoriteTerm, isTermFavorited, removeFavoriteTerm } from "./noteStorage.js";

const API_BASE_URL = 'http://localhost:3001';

function ResultsPage({ searchTerm, onNewSearch, onBack }) {
  const [query, setQuery] = useState(searchTerm);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [favorited, setFavorited] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  
useEffect(() => {
  setQuery(searchTerm);
}, [searchTerm]);

const handleCrossTermClick = (term) => {
  setQuery(term);
  onNewSearch(term);
};

const handleRelatedTermClick = (term) => {
  setQuery(term);
  onNewSearch(term);
};

const handleFavoriteToggle = () => {
  if (!resultData) return;

  setSparkle(true);
  setTimeout(() => setSparkle(false), 500);

  if (favorited) {
    removeFavoriteTerm(resultData.term);
    setFavorited(false);
    setSavedMessage("Removed from notes.");
  } else {
    const result = addFavoriteTerm(resultData);
    setFavorited(true);
    setSavedMessage(
      result.added ? "Added to notes page." : "This term is already saved."
    );
  }

  setTimeout(() => setSavedMessage(""), 2000);
};
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
          setFavorited(isTermFavorited(data.data.term));
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
            <div className="term-title-row">
              <h1 className="term-title">{resultData.term}</h1>
              <button
                className={`favorite-button ${favorited ? "active" : ""} ${sparkle ? "sparkle" : ""}`}
                onClick={handleFavoriteToggle}
                aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
                title={favorited ? "Saved to notes" : "Save to notes"}
              >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={favorited ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="sparkle-burst sparkle-1" />
                <span className="sparkle-burst sparkle-2" />
                <span className="sparkle-burst sparkle-3" />
              </button>
            </div>
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
            {savedMessage && <p className="saved-message-inline">{savedMessage}</p>}

            <section className="info-section">
              <h2 className="section-title">What is it?</h2>
              <p className="section-text">{resultData.definition}</p>
            </section>

            <section className="info-section">
              <h2 className="section-title">Common Symptoms</h2>
              <div className="symptom-grid">
                {resultData.symptoms && resultData.symptoms.map((symptom, index) => (
                  <button
                    key={index}
                    type="button"
                    className="symptom-card clickable-card"
                    onClick={() => handleCrossTermClick(symptom)}
                  >
                    <div className="symptom-icon">•</div>
                    <span>{symptom}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="info-section">
              <h2 className="section-title">Possible Causes</h2>
              <ul className="causes-list">
                {resultData.causes && resultData.causes.map((cause, index) => (
                  <li key={index} className="cause-item">{cause}</li>
                ))}
              </ul>
            </section>

            <section className="info-section">
              <h2 className="section-title">Related Terms</h2>
              <div className="related-terms">
                {resultData.relatedTerms && resultData.relatedTerms.map((term, index) => (
                    <button
                      key={index}
                      type="button"
                      className="related-term-button"
                      onClick={() => handleCrossTermClick(term)}
                    >
                      {term}
                    </button>
                  ))}
              </div>
            </section>

            {/* UMLS Medical Classification Section */}
            {resultData.umls && (
              <section className="info-section umls-section">
                <h2 className="section-title">Medical Classification (UMLS)</h2>

                <div className="umls-content">
                  {/* CUI and Preferred Name */}
                  <div className="umls-subsection">
                    <h3 className="umls-subtitle">Concept Identifier</h3>
                    <p className="umls-cui">
                      <strong>CUI:</strong> {resultData.umls.cui}
                    </p>
                    <p className="umls-preferred-name">
                      <strong>Preferred Name:</strong> {resultData.umls.preferredName}
                    </p>
                  </div>

                  {/* Semantic Types */}
                  {resultData.umls.semanticTypes && resultData.umls.semanticTypes.length > 0 && (
                    <div className="umls-subsection">
                      <h3 className="umls-subtitle">Medical Categories</h3>
                      <div className="semantic-types">
                        {resultData.umls.semanticTypes.map((type, index) => (
                          <span key={index} className="semantic-type-badge">
                            {type.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ICD-10 Codes */}
                  {resultData.umls.icd10Codes && resultData.umls.icd10Codes.length > 0 && (
                    <div className="umls-subsection">
                      <h3 className="umls-subtitle">ICD-10 Codes</h3>
                      <ul className="code-list">
                        {resultData.umls.icd10Codes.map((code, index) => (
                          <li key={index} className="code-item">
                            <span className="code-value">{code.code}</span>
                            <span className="code-name">{code.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* SNOMED CT Codes */}
                  {resultData.umls.snomedCodes && resultData.umls.snomedCodes.length > 0 && (
                    <div className="umls-subsection">
                      <h3 className="umls-subtitle">SNOMED CT Codes</h3>
                      <ul className="code-list">
                        {resultData.umls.snomedCodes.map((code, index) => (
                          <li key={index} className="code-item">
                            <span className="code-value">{code.code}</span>
                            <span className="code-name">{code.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* UMLS Definitions */}
                  {resultData.umls.definitions && resultData.umls.definitions.length > 0 && (
                    <div className="umls-subsection">
                      <h3 className="umls-subtitle">Medical Definitions</h3>
                      {resultData.umls.definitions.map((def, index) => (
                        <div key={index} className="umls-definition">
                          <p className="definition-source"><strong>Source:</strong> {def.source}</p>
                          <p className="definition-text">{def.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Source Vocabularies */}
                  {resultData.umls.sourceVocabularies && resultData.umls.sourceVocabularies.length > 0 && (
                    <div className="umls-subsection">
                      <h3 className="umls-subtitle">Available in Vocabularies</h3>
                      <div className="vocabulary-badges">
                        {resultData.umls.sourceVocabularies.map((vocab, index) => (
                          <span key={index} className="vocabulary-badge">
                            {vocab}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <div className="disclaimer">
              <strong>Important:</strong> {resultData.disclaimer || 'This information is for educational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for accurate diagnosis and treatment.'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResultsPage;

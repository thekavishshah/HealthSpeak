import { useState, useEffect } from 'react';
import './ResultsPage.css';

const API_BASE_URL = 'http://localhost:3001';

function ResultsPage({ searchTerm, cachedData, onNewSearch, onBack }) {
  const [query, setQuery] = useState(searchTerm);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fetch medical term data from backend or use cached data
  useEffect(() => {
    const fetchMedicalTerm = async () => {
      // If we have cached data, use it immediately
      if (cachedData) {
        console.log('Using cached result data');
        setResultData(cachedData);
        setFavorited(isTermFavorited(cachedData.term));
        setLoading(false);
        return;
      }

      // Otherwise, fetch from API
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
  }, [searchTerm, cachedData]);

  // Cleanup: Stop speech when component unmounts or search term changes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    onNewSearch(query);
  };

  const handleTextToSpeech = () => {
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      alert('Sorry, your browser does not support text-to-speech.');
      return;
    }

    // If currently speaking, stop it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Create text content to speak
    let textToSpeak = `${resultData.term}. `;
    textToSpeak += `Definition: ${resultData.definition}. `;

    if (resultData.symptoms && resultData.symptoms.length > 0) {
      textToSpeak += `Common symptoms include: ${resultData.symptoms.join(', ')}. `;
    }

    if (resultData.causes && resultData.causes.length > 0) {
      textToSpeak += `Possible causes include: ${resultData.causes.join(', ')}. `;
    }

    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Set speech properties
    utterance.rate = 0.9; // Slightly slower for medical terms
    utterance.pitch = 1;
    utterance.volume = 1;

    // Handle speech events
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
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
              <button
                className={`speak-button ${isSpeaking ? 'speaking' : ''}`}
                onClick={handleTextToSpeech}
                title={isSpeaking ? 'Stop listening' : 'Listen to definition'}
              >
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
                  {isSpeaking && (
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  )}
                </svg>
                {isSpeaking ? 'Stop' : 'Listen'}
              </button>
            </div>

            <section className="info-section">
              <h2 className="section-title">What is it?</h2>
              <p className="section-text">{resultData.definition}</p>
            </section>

            <section className="info-section">
              <h2 className="section-title">Common Symptoms</h2>
              <div className="symptom-grid">
                {resultData.symptoms && resultData.symptoms.map((symptom, index) => (
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
                {resultData.causes && resultData.causes.map((cause, index) => (
                  <li key={index} className="cause-item">{cause}</li>
                ))}
              </ul>
            </section>

            <section className="info-section">
              <h2 className="section-title">Related Terms</h2>
              <div className="related-terms">
                {resultData.relatedTerms && resultData.relatedTerms.map((term, index) => (
                  <button key={index} className="related-term-button">
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

import { useState, useEffect } from 'react';
import './Sidebar.css';

const API_BASE_URL = 'http://localhost:3001';

function Sidebar({ onOpenNotes, onGoHome, onHistoryClick, sidebarHistoryRef, notesRef}) {
  const [searchHistory, setSearchHistory] = useState([]);

  // Fetch search history on mount
  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // For development: use mock data if no token with sample cached results
        setSearchHistory([
          {
            id: 1,
            search_term: 'Hypertension',
            searched_at: new Date(Date.now() - 3600000).toISOString(),
            result_data: {
              term: 'Hypertension',
              definition: 'High blood pressure is a common condition where the force of blood against artery walls is consistently too high, which can lead to health problems like heart disease.',
              symptoms: ['Headaches', 'Shortness of breath', 'Nosebleeds', 'Chest pain', 'Dizziness', 'Vision problems'],
              causes: ['Family history', 'High salt diet', 'Obesity', 'Lack of physical activity'],
              relatedTerms: ['Cardiovascular disease', 'Stroke', 'Heart attack', 'Kidney disease']
            }
          },
          {
            id: 2,
            search_term: 'Diabetes',
            searched_at: new Date(Date.now() - 86400000).toISOString(),
            result_data: {
              term: 'Diabetes',
              definition: 'A chronic condition that affects how your body processes blood sugar (glucose), leading to high blood sugar levels that can cause serious health complications.',
              symptoms: ['Increased thirst', 'Frequent urination', 'Extreme hunger', 'Unexplained weight loss', 'Fatigue', 'Blurred vision'],
              causes: ['Genetic factors', 'Obesity', 'Sedentary lifestyle', 'Poor diet'],
              relatedTerms: ['Type 1 diabetes', 'Type 2 diabetes', 'Insulin resistance', 'Hyperglycemia']
            }
          },
          {
            id: 3,
            search_term: 'Migraine',
            searched_at: new Date(Date.now() - 172800000).toISOString(),
            result_data: {
              term: 'Migraine',
              definition: 'A neurological condition characterized by intense, debilitating headaches often accompanied by nausea, vomiting, and extreme sensitivity to light and sound.',
              symptoms: ['Severe headache', 'Nausea', 'Vomiting', 'Light sensitivity', 'Sound sensitivity', 'Visual disturbances'],
              causes: ['Hormonal changes', 'Stress', 'Certain foods', 'Sleep changes'],
              relatedTerms: ['Headache', 'Tension headache', 'Cluster headache', 'Aura']
            }
          }
        ]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/search/history?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch search history');
      }

      const data = await response.json();

      if (data.success && data.data) {
        setSearchHistory(data.data);
      }
    } catch (err) {
      console.error('Error fetching search history:', err);
      // Use mock data on error
      setSearchHistory([
        {
          id: 1,
          search_term: 'Hypertension',
          searched_at: new Date(Date.now() - 3600000).toISOString(),
          result_data: {
            term: 'Hypertension',
            definition: 'High blood pressure is a common condition where the force of blood against artery walls is consistently too high.',
            symptoms: ['Headaches', 'Shortness of breath', 'Nosebleeds', 'Chest pain', 'Dizziness', 'Vision problems'],
            causes: ['Family history', 'High salt diet', 'Obesity', 'Lack of physical activity'],
            relatedTerms: ['Cardiovascular disease', 'Stroke', 'Heart attack', 'Kidney disease']
          }
        },
        {
          id: 2,
          search_term: 'Diabetes',
          searched_at: new Date(Date.now() - 86400000).toISOString(),
          result_data: {
            term: 'Diabetes',
            definition: 'A chronic condition that affects how your body processes blood sugar (glucose).',
            symptoms: ['Increased thirst', 'Frequent urination', 'Extreme hunger', 'Weight loss', 'Fatigue', 'Blurred vision'],
            causes: ['Genetic factors', 'Obesity', 'Sedentary lifestyle', 'Poor diet'],
            relatedTerms: ['Type 1 diabetes', 'Type 2 diabetes', 'Insulin resistance', 'Hyperglycemia']
          }
        }
      ]);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="home-btn" onClick={onGoHome}>
          Home
        </button>
      </div>

      <div className="sidebar-actions">
        <button ref={notesRef} className="sidebar-action-btn notes-btn" onClick={onOpenNotes}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Saved Notes
        </button>
      </div>

      <div className="search-history" ref={sidebarHistoryRef}>
        <h3>Recent Searches</h3>
        <div className="history-list">
          {searchHistory.length > 0 ? (
            searchHistory.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => onHistoryClick && onHistoryClick(item.search_term, item.result_data)}
              >
                <div className="history-title">{item.search_term}</div>
                <div className="history-timestamp">{formatTimestamp(item.searched_at)}</div>
              </div>
            ))
          ) : (
            <div className="history-empty">No search history yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

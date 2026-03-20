const API_BASE_URL = 'http://localhost:3001/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('healthspeak_token');

// Set token in localStorage
const setToken = (token) => localStorage.setItem('healthspeak_token', token);

// Remove token from localStorage
const removeToken = () => localStorage.removeItem('healthspeak_token');

// Get user data from localStorage
const getUser = () => {
  const userData = localStorage.getItem('healthspeak_user');
  return userData ? JSON.parse(userData) : null;
};

// Set user data in localStorage
const setUser = (user) => localStorage.setItem('healthspeak_user', JSON.stringify(user));

// Remove user data from localStorage
const removeUser = () => localStorage.removeItem('healthspeak_user');

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ==================== Authentication API ====================

/**
 * Sign up a new user
 */
export async function signUp(userData) {
  const response = await apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (response.token) {
    setToken(response.token);
    setUser(response.user);
  }

  return response;
}

/**
 * Login user
 */
export async function login(credentials) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (response.token) {
    setToken(response.token);
    setUser(response.user);
  }

  return response;
}

/**
 * Logout user
 */
export function logout() {
  removeToken();
  removeUser();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return getUser();
}

// ==================== Medical Search API ====================

/**
 * Search for medical term
 */
export async function searchMedicalTerm(term) {
  return apiRequest('/search', {
    method: 'POST',
    body: JSON.stringify({ term }),
  });
}

/**
 * Get search history
 */
export async function getSearchHistory(limit = 20) {
  return apiRequest(`/search/history?limit=${limit}`);
}

/**
 * Get popular medical terms
 */
export async function getPopularTerms() {
  return apiRequest('/popular-terms');
}

// ==================== Chat API ====================

/**
 * Send chat message
 */
export async function sendChatMessage(message) {
  return apiRequest('/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

/**
 * Get chat history
 */
export async function getChatHistory(limit = 50) {
  return apiRequest(`/chat/history?limit=${limit}`);
}

// ==================== Health Check ====================

/**
 * Check API health
 */
export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

export default {
  signUp,
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  searchMedicalTerm,
  getSearchHistory,
  getPopularTerms,
  sendChatMessage,
  getChatHistory,
  healthCheck,
};

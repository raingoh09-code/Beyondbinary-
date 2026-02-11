const API_URL = '/api';

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

// Get auth token
function getToken() {
  return localStorage.getItem('token');
}

// Get user info
function getUserInfo() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Update navigation based on auth status
function updateNavigation() {
  const authLinks = document.getElementById('authLinks');
  const userLinks = document.getElementById('userLinks');
  const profileLink = document.getElementById('profileLink');
  
  if (!authLinks) return;
  
  if (isLoggedIn()) {
    authLinks.style.display = 'none';
    if (userLinks) userLinks.style.display = 'flex';
    if (profileLink) profileLink.style.display = 'block';
    
    // Attach logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }
  } else {
    authLinks.style.display = 'flex';
    if (userLinks) userLinks.style.display = 'none';
    if (profileLink) profileLink.style.display = 'none';
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Protect page (redirect if not logged in)
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

// API request helper
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
}

// Initialize auth on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateNavigation);
} else {
  updateNavigation();
}

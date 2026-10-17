const API_BASE_URL = 'http://localhost:5000/api';

const TOKEN_KEY = 'student_task_manager_jwt_token';
const USER_KEY = 'student_task_manager_user_profile';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getAuthHeaders(includeContentType = true) {
  const headers = {};
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Handle 401 unauthenticated responses
function handleResponseStatus(res, json) {
  if (res.status === 401) {
    clearStoredSession();
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error(json.message || 'Session expired or invalid. Please sign in again.');
  }
}

// --- AUTHENTICATION APIS ---
export async function registerStudent({ name, email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.errors ? json.errors.join(', ') : json.message;
    throw new Error(errorMsg || 'Registration failed');
  }
  setStoredSession(json.token, json.user);
  return json;
}

export async function loginStudent({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Invalid email or password');
  }
  setStoredSession(json.token, json.user);
  return json;
}

export async function fetchCurrentStudent() {
  const token = getStoredToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(false)
  });
  const json = await res.json();
  if (!res.ok) {
    clearStoredSession();
    return null;
  }
  return json.user;
}

// --- TASK MANAGEMENT APIS (AUTHENTICATED & USER-SCOPED) ---
export async function fetchTasks(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.subject && filters.subject !== 'all') params.append('subject', filters.subject);
  if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
  if (filters.deadline && filters.deadline !== 'all') params.append('deadline', filters.deadline);
  if (filters.search) params.append('search', filters.search);

  const res = await fetch(`${API_BASE_URL}/tasks?${params.toString()}`, {
    headers: getAuthHeaders(false)
  });
  const json = await res.json();
  handleResponseStatus(res, json);
  if (!res.ok) throw new Error(json.message || 'Failed to fetch tasks');
  return json.data;
}

export async function fetchTaskById(id) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    headers: getAuthHeaders(false)
  });
  const json = await res.json();
  handleResponseStatus(res, json);
  if (!res.ok) throw new Error(json.message || 'Failed to fetch task');
  return json.data;
}

export async function createTask(taskData) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(taskData)
  });
  const json = await res.json();
  handleResponseStatus(res, json);
  if (!res.ok) {
    const errorMsg = json.errors ? json.errors.join(', ') : json.message;
    throw new Error(errorMsg || 'Failed to create task');
  }
  return json.data;
}

export async function updateTask(id, taskData) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(taskData)
  });
  const json = await res.json();
  handleResponseStatus(res, json);
  if (!res.ok) {
    const errorMsg = json.errors ? json.errors.join(', ') : json.message;
    throw new Error(errorMsg || 'Failed to update task');
  }
  return json.data;
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false)
  });
  const json = await res.json();
  handleResponseStatus(res, json);
  if (!res.ok) throw new Error(json.message || 'Failed to delete task');
  return json;
}

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE_URL}/dashboard`, {
    headers: getAuthHeaders(false)
  });
  const json = await res.json();
  handleResponseStatus(res, json);
  if (!res.ok) throw new Error(json.message || 'Failed to fetch dashboard stats');
  return json.data;
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to check system health');
  return json.data;
}

const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...options.headers };

  // Don't set Content-Type if sending FormData (browser sets boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Check if token exists in localStorage as an extra bearer fallback for environments without cookie persistence
  const localToken = localStorage.getItem('auth_token');
  if (localToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${localToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // sends HTTP-only cookie
  });

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    const error = new Error(data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request('/auth/me'),

  // Items
  getItems: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const query = searchParams.toString();
    return request(`/items${query ? `?${query}` : ''}`);
  },

  getCampusHotspots: () => request('/items/hotspots'),

  getRecentRecoveries: () => request('/items/recoveries'),

  getItemById: (id) => request(`/items/${id}`),

  getMyItems: () => request('/items/my'),

  createItem: (formData) =>
    request('/items', {
      method: 'POST',
      body: formData,
    }),

  updateItem: (id, formData) =>
    request(`/items/${id}`, {
      method: 'PUT',
      body: formData,
    }),

  closeItem: (id, statusData) =>
    request(`/items/${id}/close`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    }),

  // Claims
  submitClaim: (itemId, claimData) =>
    request(`/claims/item/${itemId}`, {
      method: 'POST',
      body: JSON.stringify(claimData),
    }),

  getMyClaims: () => request('/claims/my-claims'),

  getClaimsForItem: (itemId) => request(`/claims/item/${itemId}`),

  respondToClaim: (claimId, decisionData) =>
    request(`/claims/${claimId}/decision`, {
      method: 'PATCH',
      body: JSON.stringify(decisionData),
    }),

  // Matches
  getMatchesForItem: (itemId) => request(`/matches/item/${itemId}`),

  getMyMatches: () => request('/matches/my-matches'),

  // Content Reporting
  submitReport: (itemId, reportData) =>
    request(`/reports/item/${itemId}`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),

  // Admin
  getAdminStats: () => request('/admin/stats'),

  getAdminListings: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const query = searchParams.toString();
    return request(`/admin/listings${query ? `?${query}` : ''}`);
  },

  toggleHideListing: (itemId, reason) =>
    request(`/admin/listings/${itemId}/hide`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  getAdminReports: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return request(`/admin/reports${searchParams ? `?${searchParams}` : ''}`);
  },

  moderateReport: (reportId, data) =>
    request(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getAdminUsers: () => request('/admin/users'),
};

// Cribtopia API Client
// Connects to local PostgreSQL backend when available, falls back to mock data

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.warn(`API call failed for ${endpoint}:`, error.message);
    return null;
  }
}

// Listings API
export const Listing = {
  async list(filters = {}) {
    const params = new URLSearchParams(filters);
    const result = await apiCall(`/api/listings?${params}`);
    return result || [];
  },
  
  async get(id) {
    return apiCall(`/api/listings/${id}`);
  },
  
  async create(data) {
    return apiCall('/api/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async update(id, data) {
    return apiCall(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async delete(id) {
    return apiCall(`/api/listings/${id}`, {
      method: 'DELETE',
    });
  },
};

// Offers API
export const Offer = {
  async list() {
    return apiCall('/api/offers') || [];
  },
  
  async create(data) {
    return apiCall('/api/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Closing Workflow API (mock for now)
export const ClosingWorkflow = {
  async list() {
    return [];
  },
  async create(data) {
    return { id: 'workflow-new', ...data };
  },
};

// User API
export const User = {
  async me() {
    return apiCall('/api/users/me') || {
      id: 'user-demo',
      email: 'demo@cribtopia.com',
      full_name: 'Demo User',
      role: 'buyer',
    };
  },
};

export default { Listing, Offer, ClosingWorkflow, User };
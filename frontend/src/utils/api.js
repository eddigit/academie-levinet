import axios from 'axios';

// En mode unifié (production), utiliser des URLs relatives
// En développement local, REACT_APP_BACKEND_URL peut pointer vers le backend séparé
const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Extract error message from API error response
 * Handles both string and Pydantic validation error objects
 */
export const getErrorMessage = (error, defaultMessage = 'Une erreur est survenue') => {
  const detail = error?.response?.data?.detail;
  
  if (!detail) {
    return error?.message || defaultMessage;
  }
  
  // If detail is a string, return it directly
  if (typeof detail === 'string') {
    return detail;
  }
  
  // If detail is an array (Pydantic validation errors)
  if (Array.isArray(detail)) {
    return detail.map(err => {
      if (typeof err === 'string') return err;
      if (err.msg) return err.msg;
      return JSON.stringify(err);
    }).join(', ');
  }
  
  // If detail is an object with msg property (single Pydantic error)
  if (typeof detail === 'object' && detail.msg) {
    return detail.msg;
  }
  
  // Fallback: stringify the object
  try {
    return JSON.stringify(detail);
  } catch {
    return defaultMessage;
  }
};

// Create axios instance for direct calls
const apiInstance = axios.create({
  baseURL: API,
});

// Add auth header interceptor
apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await axios.get(`${API}/dashboard/stats`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // ==================== USERS UNIFIED API ====================
  // Tous les utilisateurs sont dans la table 'users' avec un champ 'role'

  // Membres (role=membre) - accessible à tous les utilisateurs connectés
  getMembers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API}/members${params ? '?' + params : ''}`, {
      headers: getAuthHeader()
    });
    // L'endpoint /members retourne directement un array
    return Array.isArray(response.data) ? response.data : (response.data?.users || []);
  },

  getMember: async (id) => {
    const response = await axios.get(`${API}/members/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Admin operations - requires admin role
  createMember: async (data) => {
    const userData = {
      ...data,
      full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      role: 'eleve'  // Nouveau rôle pour les élèves avec club
    };
    const response = await axios.post(`${API}/admin/users`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateMember: async (id, data) => {
    const userData = { ...data };
    if (data.first_name || data.last_name) {
      userData.full_name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    }
    const response = await axios.put(`${API}/admin/users/${id}`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteMember: async (id) => {
    const response = await axios.delete(`${API}/admin/users/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Directeurs Techniques (accessible à tous les utilisateurs connectés)
  getTechnicalDirectors: async () => {
    const response = await axios.get(`${API}/technical-directors`, {
      headers: getAuthHeader()
    });
    // Backend returns array directly
    return Array.isArray(response.data) ? response.data : (response.data?.users || []);
  },

  createTechnicalDirector: async (data) => {
    const userData = {
      ...data,
      full_name: data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      role: 'directeur_technique'
    };
    const response = await axios.post(`${API}/admin/users`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateTechnicalDirector: async (id, data) => {
    const response = await axios.put(`${API}/admin/users/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteTechnicalDirector: async (id) => {
    const response = await axios.delete(`${API}/admin/users/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Instructeurs (accessible à tous les utilisateurs connectés)
  getInstructors: async () => {
    const response = await axios.get(`${API}/instructors`, {
      headers: getAuthHeader()
    });
    // Backend returns array directly
    return Array.isArray(response.data) ? response.data : (response.data?.users || []);
  },

  createInstructor: async (data) => {
    const userData = {
      ...data,
      full_name: data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      role: 'instructeur'
    };
    const response = await axios.post(`${API}/admin/users`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateInstructor: async (id, data) => {
    const response = await axios.put(`${API}/admin/users/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteInstructor: async (id) => {
    const response = await axios.delete(`${API}/admin/users/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Subscriptions
  getSubscriptions: async (memberId = null) => {
    const params = memberId ? `?member_id=${memberId}` : '';
    const response = await axios.get(`${API}/subscriptions${params}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  createSubscription: async (data) => {
    const response = await axios.post(`${API}/subscriptions`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Forums
  getForums: async () => {
    const response = await axios.get(`${API}/forums`, {
      headers: getAuthHeader()
    });
    return response.data?.forums || response.data || [];
  },
};

// Export axios instance for direct API calls (get, post, put, delete)
export default apiInstance;
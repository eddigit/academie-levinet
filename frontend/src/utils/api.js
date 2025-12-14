import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${API_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await axios.get(`${API}/dashboard/stats`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Members
  getMembers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API}/members?${params}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getMember: async (id) => {
    const response = await axios.get(`${API}/members/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  createMember: async (data) => {
    const response = await axios.post(`${API}/members`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateMember: async (id, data) => {
    const response = await axios.put(`${API}/members/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteMember: async (id) => {
    const response = await axios.delete(`${API}/members/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Technical Directors
  getTechnicalDirectors: async () => {
    const response = await axios.get(`${API}/technical-directors`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  createTechnicalDirector: async (data) => {
    const response = await axios.post(`${API}/technical-directors`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateTechnicalDirector: async (id, data) => {
    const response = await axios.put(`${API}/technical-directors/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteTechnicalDirector: async (id) => {
    const response = await axios.delete(`${API}/technical-directors/${id}`, {
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
};
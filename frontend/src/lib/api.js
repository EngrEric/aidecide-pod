import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const api = {
  // Admin
  adminLogin: async (email, password) => {
    const response = await axios.post(`${API}/admin/login`, { email, password });
    return response.data;
  },
  
  // Submissions
  createSubmission: async (data) => {
    const response = await axios.post(`${API}/submissions`, data);
    return response.data;
  },
  
  getSubmissions: async (status = null, flagged = null) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (flagged) params.append("flagged", "true");
    
    const response = await axios.get(`${API}/submissions?${params.toString()}`);
    return response.data;
  },
  
  getSubmission: async (id) => {
    const response = await axios.get(`${API}/submissions/${id}`);
    return response.data;
  },
  
  deleteSubmission: async (id) => {
    const response = await axios.delete(`${API}/submissions/${id}`);
    return response.data;
  },
  
  // Dashboard
  getDashboardStats: async () => {
    const response = await axios.get(`${API}/dashboard/stats`);
    return response.data;
  }
};

export default api;

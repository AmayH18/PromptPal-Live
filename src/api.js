import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080", 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("promptpal_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getWellnessScore = (userId) =>
  API.get(`/dashboard/score/${userId}`);

export const getWellnessProgress = (userId) =>
  API.get(`/dashboard/progress/${userId}`);

export default API;



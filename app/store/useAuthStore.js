// import api from "@/utils/axios";
// import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { create } from "zustand";
// import axios from "../utils/axios";

const baseUrl = "https://buddy-chat-backend-ii8g.onrender.com/api/v1/auth";
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  error: null,
  loading: false,
  success: null,
  isLoggedIn: false,
  isLoading: false,
  hydrate: () => {
    const token = AsyncStorage.getItem("token");
    if (token) {
      set({ token });
    }
  },
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${baseUrl}/login`, { email, password });

      const { token, name, success } = res.data;

      await AsyncStorage.setItem("token", token);
      set({ name, token, loading: false, isLoggedIn: true });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
      return false;
    }
  },
  signup: async (formData) => {
    console.log(formData);
    set({ loading: true, error: null, success: false });
    try {
      const res = await axios.post(`${baseUrl}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res);
      set({
        success: true,
        loading: false,
      });
      return true;
    } catch (err) {
      console.log(err);
      set({
        error: err?.response?.data?.message || "Signup failed",
        success: false,
        loading: false,
      });
      return false;
    }
  },

  logout: () => {
    AsyncStorage.removeItem("token");
    set({ isLoading: false, user: null, isLoggedIn: false });
    return true;
  },

  fetchUserProfile: async () => {
    set({ isLoading: true });
    const token = await AsyncStorage.getItem("token");
    try {
      // const res = await api.get(`/auth/me`); // should return current user profile
      const res = await axios.get(`${baseUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ user: res.data, isLoading: false, isLoggedIn: true });
      return true;
    } catch (err) {
      await AsyncStorage.removeItem("token");
      set({ isLoading: false, user: null, isLoggedIn: false });
      return false;
    }
  },

  // Load user from storage on app start
  loadUserFromStorage: async () => {
    const token = await AsyncStorage.removeItem("token");
    if (token) {
      try {
        const res = await axios.get(`${baseUrl}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res, "hshs");
        set({ user: res.data, token });
      } catch (err) {
        console.error("Token expired:", err);
        await AsyncStorage.removeItem("token");
        set({ user: null, token: null });
      }
    }
  },
}));

export default useAuthStore;

import TUser from "@/types/user.interface";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@/constants/api";
interface RegisterResponse {
  token: string;
  _id: string;
  username: string;
  email: string;
  profileImages: string;
  createdAt: string;
}
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  isCheckingAuth: true,
  register: async ({ username, email, password }: TUser) => {
    set({ loading: true });
    try {
      const response = await axios.post<RegisterResponse>(
        `${API_URL}/api/auth/register`,
        {
          username,
          email,
          password,
        }
      );

      const data = response.data;
      const userData = {
        _id: data._id,
        username: data.username,
        email: data.email,
        profileImages: data.profileImages,
      };

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("token", data.token);

      set({
        user: userData,
        token: data.token,
        loading: false,
      });
      return {
        success: true,
      };
    } catch (error: any) {
      set({ loading: false });
      return {
        success: false,
        error: error.message,
      };
    }
  },
  login: async ({ email, password }: TUser) => {
    set({ loading: true });
    try {
      const response = await axios.post<RegisterResponse>(
        `${API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      const data = response.data;
      const userData = {
        _id: data._id,
        username: data.username,
        email: data.email,
        profileImages: data.profileImages,
        createdAt: data.createdAt,
      };

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("token", data.token);

      set({
        user: userData,
        token: data.token,
        loading: false,
      });
      return {
        success: true,
      };
    } catch (error: any) {
      set({ loading: false });
    }
  },
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      set({ user, token });
    } catch (error) {
      console.log("Auth check failed ");
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));

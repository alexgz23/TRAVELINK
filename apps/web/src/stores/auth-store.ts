import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse, LoginDto, RegisterDto } from '@/types';
import { apiClient, post } from '@/lib/api-client';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/lib/constants';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

/**
 * Authentication store using Zustand
 * Handles user authentication state and actions
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login user
       */
      login: async (credentials: LoginDto) => {
        set({ isLoading: true, error: null });

        try {
          const response = await post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);

          const { user, accessToken, refreshToken } = response;

          // Save tokens to localStorage
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      /**
       * Register new user
       */
      register: async (data: RegisterDto) => {
        set({ isLoading: true, error: null });

        try {
          const response = await post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);

          const { user, accessToken, refreshToken } = response;

          // Save tokens to localStorage
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Error al registrarse';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      /**
       * Logout user
       */
      logout: () => {
        // Clear tokens from localStorage
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);

        // Reset state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      /**
       * Set user data
       */
      setUser: (user: User) => {
        set({ user });
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Check authentication status (get current user)
       */
      checkAuth: async () => {
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (!accessToken) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const user = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
          set({
            user: user.data,
            accessToken,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token is invalid or expired
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

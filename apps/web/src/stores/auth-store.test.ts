import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStore } from './auth-store';
import { post } from '@/lib/api-client';
import { STORAGE_KEYS } from '@/lib/constants';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  post: vi.fn(),
  get: vi.fn(),
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear store state
    useAuthStore.getState().logout();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with unauthenticated state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.accessToken).toBeNull();
  });

  it('logs in successfully', async () => {
    const mockResponse = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'TRAVELER',
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    vi.mocked(post).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user).toEqual(mockResponse.user);
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('mock-access-token');
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe('mock-refresh-token');
    expect(post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('handles login error', async () => {
    const error = new Error('Invalid credentials');
    vi.mocked(post).mockRejectedValue(error);

    const { result } = renderHook(() => useAuthStore());

    await expect(
      act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'wrong-password',
        });
      })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('registers user successfully', async () => {
    const mockResponse = {
      user: {
        id: 'user-1',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'TRAVELER',
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    vi.mocked(post).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.register({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user).toEqual(mockResponse.user);
    expect(post).toHaveBeenCalledWith('/auth/register', {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
  });

  it('logs out successfully', async () => {
    // First login
    const mockResponse = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'TRAVELER',
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    vi.mocked(post).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.accessToken).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull();
  });

  it('persists auth state to localStorage', async () => {
    const mockResponse = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'TRAVELER',
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    vi.mocked(post).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Check that state is persisted
    const persistedData = localStorage.getItem('auth-storage');
    expect(persistedData).toBeTruthy();

    // Create new hook instance to verify persistence
    const { result: newResult } = renderHook(() => useAuthStore());
    expect(newResult.current.user).toEqual(mockResponse.user);
    expect(newResult.current.isAuthenticated).toBe(true);
  });
});

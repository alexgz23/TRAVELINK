import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExperiences, useExperience } from './use-experiences';
import { get } from '@/lib/api-client';
import { mockExperience, createTestQueryClient } from '@/tests/utils/test-utils';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

describe('useExperiences Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('fetches experiences successfully', async () => {
    const mockData = {
      data: [mockExperience(), mockExperience({ id: '2', title: 'Experience 2' })],
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        hasNextPage: false,
      },
    };

    vi.mocked(get).mockResolvedValue(mockData);

    const { result } = renderHook(() => useExperiences(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(get).toHaveBeenCalledWith('/experiences?');
  });

  it('applies filters to query', async () => {
    const mockData = {
      data: [mockExperience({ category: 'ADVENTURE' })],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        hasNextPage: false,
      },
    };

    vi.mocked(get).mockResolvedValue(mockData);

    const filters = {
      category: 'ADVENTURE',
      minPrice: 50000,
      maxPrice: 150000,
      city: 'Bogotá',
    };

    const { result } = renderHook(() => useExperiences(filters), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('category=ADVENTURE')
    );
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('minPrice=50000')
    );
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('maxPrice=150000')
    );
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('city=Bogot%C3%A1')
    );
  });

  it('handles error state', async () => {
    const error = new Error('Failed to fetch experiences');
    vi.mocked(get).mockRejectedValue(error);

    const { result } = renderHook(() => useExperiences(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});

describe('useExperience Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('fetches single experience successfully', async () => {
    const mockData = mockExperience();
    vi.mocked(get).mockResolvedValue(mockData);

    const { result } = renderHook(() => useExperience('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(get).toHaveBeenCalledWith('/experiences/1');
  });

  it('does not fetch when id is undefined', () => {
    renderHook(() => useExperience(undefined as any), { wrapper });

    expect(get).not.toHaveBeenCalled();
  });

  it('handles error when experience not found', async () => {
    const error = new Error('Experience not found');
    vi.mocked(get).mockRejectedValue(error);

    const { result } = renderHook(() => useExperience('999'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});

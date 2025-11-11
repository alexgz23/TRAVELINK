import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants';

/**
 * Fetch user points balance and level info
 */
export function usePointsBalance() {
  return useQuery({
    queryKey: QUERY_KEYS.GAMIFICATION.BALANCE,
    queryFn: () => get<PointsBalance>(API_ENDPOINTS.GAMIFICATION.BALANCE),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch user points transaction history
 */
export function usePointsHistory() {
  return useQuery({
    queryKey: QUERY_KEYS.GAMIFICATION.HISTORY,
    queryFn: () => get<PointsTransaction[]>(API_ENDPOINTS.GAMIFICATION.HISTORY),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch all levels information
 */
export function useLevels() {
  return useQuery({
    queryKey: QUERY_KEYS.GAMIFICATION.LEVELS,
    queryFn: () => get<Level[]>(API_ENDPOINTS.GAMIFICATION.LEVELS),
    staleTime: 1000 * 60 * 60, // 1 hour (rarely changes)
  });
}

/**
 * Fetch points earning/spending rules
 */
export function usePointsRules() {
  return useQuery({
    queryKey: QUERY_KEYS.GAMIFICATION.RULES,
    queryFn: () => get<PointsRules>(API_ENDPOINTS.GAMIFICATION.RULES),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Types
interface PointsBalance {
  currentPoints: number;
  totalEarned: number;
  totalSpent: number;
  expiringSoon: number;
  currentLevel: {
    level: string;
    minPoints: number;
    maxPoints: number | null;
    name: string;
    benefits: string[];
    progress: number;
  };
  nextLevel: {
    level: string;
    minPoints: number;
    maxPoints: number | null;
    name: string;
  } | null;
  pointsToNextLevel: number;
}

interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  reason: string;
  referenceId?: string;
  referenceType?: string;
  expiresAt?: string;
  isExpired: boolean;
  createdAt: string;
}

interface Level {
  level: string;
  minPoints: number;
  maxPoints: number | null;
  name: string;
  benefits: string[];
}

interface PointsRules {
  [key: string]: {
    type: string;
    points: number;
    description: string;
  };
}

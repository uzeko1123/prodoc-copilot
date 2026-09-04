import { useAuthStore } from '../stores';
import { queryClient } from '@/lib/query-client';

export function clearAuth() {
  queryClient.clear();
  useAuthStore.getState().clear();
}

import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '../stores';

export function clearAuth() {
  queryClient.clear();
  useAuthStore.getState().clear();
}

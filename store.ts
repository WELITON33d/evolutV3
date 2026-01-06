// Re-export everything from the context to maintain backward compatibility
// but using the real implementation backed by Supabase
import { useStoreContext } from './contexts/StoreContext';

export const useStore = useStoreContext;

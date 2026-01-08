import { useRef } from 'react';
import type { TabName } from '@/types';

const TABS: TabName[] = ['sleep', 'activities', 'cycles', 'stats', 'settings'];

/**
 * Hook for managing tab transition animations
 * Returns the appropriate CSS class based on navigation direction
 * Uses ref instead of state to avoid extra re-renders
 */
export const useTabTransition = (activeTab: TabName): string => {
  const prevTabRef = useRef<TabName>(activeTab);

  const prevIndex = TABS.indexOf(prevTabRef.current);
  const currentIndex = TABS.indexOf(activeTab);
  const direction = currentIndex >= prevIndex ? 'right' : 'left';

  // Update ref for next comparison (doesn't trigger re-render)
  prevTabRef.current = activeTab;

  return direction === 'right' ? 'tab-content' : 'tab-content-reverse';
};

export default useTabTransition;

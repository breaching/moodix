import { memo } from 'react';
import { useRipple } from '@/hooks';
import type { NavBtnProps } from '@/types';

/**
 * Navigation button component with ripple effect
 */
export const NavBtn = memo(function NavBtn({ label, icon: Icon, active, onClick }: NavBtnProps) {
  const createRipple = useRipple();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`nav-btn ripple-container px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 flex-shrink-0 ${
        active
          ? 'active bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30 scale-105'
          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)] hover:scale-105'
      }`}
      aria-pressed={active}
      aria-label={label}
    >
      <Icon className={`w-5 h-5 transition-transform ${active ? 'animate-pop-in' : ''}`} />
      <span className="text-xs font-bold hidden sm:inline">{label}</span>
    </button>
  );
});

export default NavBtn;

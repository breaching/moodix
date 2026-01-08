import { useState, useEffect, memo } from 'react';

interface AnimatedNumberProps {
  value: number | string;
  className?: string;
}

/**
 * Number component that animates when value changes
 */
export const AnimatedNumber = memo(function AnimatedNumber({
  value,
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      setDisplayValue(value);
      const timeout = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [value, displayValue]);

  return (
    <span
      className={`number-animate ${isAnimating ? 'changed' : ''} ${className}`}
      aria-live="polite"
    >
      {displayValue}
    </span>
  );
});

export default AnimatedNumber;

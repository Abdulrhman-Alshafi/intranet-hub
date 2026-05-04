import { useState, useEffect, useCallback } from 'react';

export function useViewportHeight(domElement: HTMLElement | null): number {
  const [height, setHeight] = useState<number>(window.innerHeight);

  const measure = useCallback(() => {
    if (domElement) {
      const rect = domElement.getBoundingClientRect();
      const available = window.innerHeight - rect.top;
      setHeight(Math.max(available, 400));
    } else {
      setHeight(window.innerHeight);
    }
  }, [domElement]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    // Re-measure after a short delay to account for SharePoint rendering
    const timer = setTimeout(measure, 500);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(timer);
    };
  }, [measure]);

  return height;
}

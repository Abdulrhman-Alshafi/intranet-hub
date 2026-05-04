import * as React from 'react';
import { motion } from 'framer-motion';

interface ILoadingSpinnerProps {
  count?: number;
  type?: 'card' | 'list' | 'inline';
}

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear' as const,
  },
};

const skeletonStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  borderRadius: 8,
};

const LoadingSpinner: React.FC<ILoadingSpinnerProps> = ({ count = 3, type = 'card' }) => {
  if (type === 'inline') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '20px 0' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 20,
            height: 20,
            border: '2px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
          }}
        />
        <span style={{ fontSize: 14, color: '#64748b' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 0' }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          {...shimmer}
          style={{
            ...skeletonStyle,
            height: type === 'card' ? 80 : 48,
            width: '100%',
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;

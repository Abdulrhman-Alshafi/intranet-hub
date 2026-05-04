import * as React from 'react';
import { motion } from 'framer-motion';

interface IErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<IErrorStateProps> = ({ message, onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        fontSize: 28,
      }}>
        ⚠️
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Something went wrong</h3>
      <p style={{ margin: 0, fontSize: 14, color: '#64748b', maxWidth: 300 }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 16,
            padding: '8px 20px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
};

export default ErrorState;

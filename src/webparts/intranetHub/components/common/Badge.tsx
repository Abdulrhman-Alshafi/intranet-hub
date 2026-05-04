import * as React from 'react';

interface IBadgeProps {
  count: number;
}

const Badge: React.FC<IBadgeProps> = ({ count }) => {
  if (count <= 0) return null;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 20,
      height: 20,
      padding: '0 6px',
      borderRadius: 10,
      background: '#ef4444',
      color: '#fff',
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1,
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default Badge;

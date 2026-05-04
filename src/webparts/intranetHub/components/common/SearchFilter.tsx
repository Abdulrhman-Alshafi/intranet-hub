import * as React from 'react';

interface ISearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}

const SearchFilter: React.FC<ISearchFilterProps> = ({
  searchValue,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  placeholder = 'Search...',
  children,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          flex: 1,
          minWidth: 200,
          position: 'relative',
        }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          >
            <path d="M7 12A5 5 0 107 2a5 5 0 000 10zM13 13l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              fontSize: 14,
              color: '#1e293b',
              outline: 'none',
              transition: 'border-color 0.15s ease',
              background: '#f8fafc',
              boxSizing: 'border-box',
            }}
          />
        </div>
        {categories && onCategoryChange && (
          <select
            value={selectedCategory || ''}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              fontSize: 14,
              color: '#1e293b',
              background: '#f8fafc',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
        {children}
      </div>
    </div>
  );
};

export default SearchFilter;

import * as React from 'react';
import styles from './Announcements.module.scss';
import { IAnnouncementItem, CATEGORY_COLORS } from '../../../models/IAnnouncementItem';

const IconPin: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
  </svg>
);

interface IAnnouncementCardProps {
  item: IAnnouncementItem;
  onClick: () => void;
}

const AnnouncementCard: React.FC<IAnnouncementCardProps> = ({ item, onClick }) => {
  const stripHtml = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const color = CATEGORY_COLORS[item.Category] || '#6b7280';

  return (
    <div
      className={`${styles.card} ${item.IsHidden ? styles.hiddenCard : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {item.Image && (
        <div className={styles.cardImage}>
          <img src={item.Image} alt={item.Title} />
        </div>
      )}
      <div className={styles.cardContent}>
        <div className={styles.cardTop}>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 14, fontWeight: 600, color: '#0f172a', flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
            {item.IsPinned && <span style={{ color: '#d97706', flexShrink: 0 }}><IconPin filled /></span>}
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.Title}</span>
          </div>
          <span className={styles.categoryBadge} style={{ background: `${color}18`, color }}>
            {item.Category}
          </span>
        </div>
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
          {stripHtml(item.Description)}
        </div>
        <div className={styles.cardMeta}>
          <span>{formatDate(item.Created)}</span>
          <span>·</span>
          <span>{item.Author?.Title || 'Admin'}</span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;


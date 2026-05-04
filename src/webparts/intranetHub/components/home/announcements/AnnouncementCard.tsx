import * as React from 'react';
import { motion } from 'framer-motion';
import styles from './Announcements.module.scss';
import { IAnnouncementItem } from '../../../models/IAnnouncementItem';

interface IAnnouncementCardProps {
  item: IAnnouncementItem;
  isAdmin: boolean;
  onClick: () => void;
  onPin: (id: number, isPinned: boolean) => void;
  onHide: (id: number) => void;
  onDelete: (id: number) => void;
}

const AnnouncementCard: React.FC<IAnnouncementCardProps> = ({ item, isAdmin, onClick, onPin, onHide, onDelete }) => {
  const [showActions, setShowActions] = React.useState(false);

  const categoryColors: Record<string, string> = {
    Company: '#2563eb',
    HR: '#dc2626',
    IT: '#059669',
    Facilities: '#d97706',
    Sales: '#7c3aed',
    Events: '#0891b2',
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const stripHtml = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <motion.div
      className={styles.card}
      onClick={onClick}
      whileHover={{ y: -1 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {item.Image && (
        <div className={styles.cardImage}>
          <img src={item.Image} alt={item.Title} />
        </div>
      )}
      <div className={styles.cardContent}>
        <div className={styles.cardTop}>
          <h3 className={styles.cardTitle}>{item.Title}</h3>
          <span
            className={styles.categoryBadge}
            style={{ background: `${categoryColors[item.Category] || '#6b7280'}15`, color: categoryColors[item.Category] || '#6b7280' }}
          >
            {item.Category}
          </span>
        </div>
        <p className={styles.cardDesc}>{stripHtml(item.Description).substring(0, 120)}...</p>
        <div className={styles.cardMeta}>
          <span>{formatDate(item.Created)}</span>
          <span>·</span>
          <span>by {item.Author?.Title || 'Admin'}</span>
        </div>
      </div>

      {isAdmin && showActions && (
        <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.actionBtn}
            onClick={() => onPin(item.Id, !item.IsPinned)}
            title={item.IsPinned ? 'Unpin' : 'Pin'}
          >
            📌
          </button>
          <button className={styles.actionBtn} onClick={() => onHide(item.Id)} title="Hide">
            👁️
          </button>
          <button className={styles.actionBtn} onClick={() => onDelete(item.Id)} title="Delete">
            🗑️
          </button>
        </div>
      )}

      {item.IsPinned && (
        <div className={styles.pinnedIcon} title="Pinned">📌</div>
      )}
    </motion.div>
  );
};

export default AnnouncementCard;

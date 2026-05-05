import * as React from 'react';
import Modal from '../../common/Modal';
import styles from './Kudos.module.scss';
import { IKudosItem } from '../../../models/IKudosItem';
import { KudosService } from '../../../services/KudosService';
import { useWebPartContext } from '../../../context/WebPartContext';

const IconPerson: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
  </svg>
);

const IconHeart: React.FC<{ filled: boolean; size?: number }> = ({ filled, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconTrash: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const IconEyeOff: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const IconEye: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

interface IKudosCardProps {
  item: IKudosItem;
  isAdmin: boolean;
  siteUrl: string;
  onDelete?: (id: number) => void;
  onHide?: (id: number, hidden: boolean) => void;
}

const KudosCard: React.FC<IKudosCardProps> = ({ item, isAdmin, siteUrl, onDelete, onHide }) => {
  const { sp, listNames } = useWebPartContext();
  const [likes, setLikes] = React.useState(item.LikesCount || 0);
  const [liked, setLiked] = React.useState(item.IsLikedByMe || false);
  const [imgError, setImgError] = React.useState(false);
  const [showPopover, setShowPopover] = React.useState(false);

  const handleLike = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    if (!sp) return;
    try {
      const svc = new KudosService(sp, listNames.kudos, listNames.kudosLikes);
      const nowLiked = await svc.toggleLike(item.Id);
      setLiked(nowLiked);
      setLikes(prev => nowLiked ? prev + 1 : Math.max(0, prev - 1));
    } catch { /* swallow */ }
  };

  const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const photoUrl = React.useMemo((): string | null => {
    if (imgError) return null;
    if (item.GivenBy?.EMail) {
      return `${siteUrl}/_layouts/15/userphoto.aspx?size=L&accountname=${encodeURIComponent(item.GivenBy.EMail)}`;
    }
    return null;
  }, [item.GivenBy, siteUrl, imgError]);

  const avatar = (size: 'sm' | 'lg'): React.ReactElement => {
    const cls = size === 'lg' ? styles.eomPopoverAvatar : styles.kudosAvatar;
    return (
      <div className={cls}>
        {photoUrl
          ? <img src={photoUrl} alt={item.GivenBy?.Title || ''} onError={() => setImgError(true)} />
          : <span className={styles.personIcon}><IconPerson /></span>
        }
      </div>
    );
  };

  return (
    <>
      <div
        className={`${styles.kudosCard} ${item.IsHidden ? styles.hiddenCard : ''}`}
        onClick={() => setShowPopover(true)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setShowPopover(true)}
      >
        {avatar('sm')}
        <div className={styles.kudosContent} style={{ flex: 1, minWidth: 0, overflow: 'hidden', width: 0 }}>
          <div className={styles.kudosHeader}>
            <strong>{item.GivenBy?.Title || 'Someone'}</strong>
            <span className={styles.kudosTime}>{timeAgo(item.Created)}</span>
          </div>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 12, color: '#64748b', marginBottom: 2 }}>{item.Title}</div>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 12, color: '#2563eb', fontWeight: 500 }}>→ {item.Recipient?.Title}</div>
        </div>
        <div className={styles.kudosActions}>
          <button
            className={`${styles.likeBtn} ${liked ? styles.liked : ''}`}
            onClick={handleLike}
            title={liked ? 'Unlike' : 'Like'}
          >
            <IconHeart filled={liked} />
            {likes > 0 && <span>{likes}</span>}
          </button>
        </div>
      </div>

      {showPopover && (
        <Modal isOpen={showPopover} onClose={() => setShowPopover(false)} title="Kudos" size="medium" transparentBackdrop>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className={styles.popoverHeader}>
              {avatar('sm')}
              <div className={styles.popoverSenderInfo}>
                <strong>{item.GivenBy?.Title || 'Someone'}</strong>
                <span className={styles.popoverTime}>{timeAgo(item.Created)}</span>
              </div>
            </div>

            <p className={styles.popoverMsg}>{item.Title}</p>
            <span className={styles.popoverRecipient}>→ {item.Recipient?.Title}</span>

            <div className={styles.popoverFooter}>
              <button
                className={`${styles.likeBtn} ${liked ? styles.liked : ''}`}
                onClick={handleLike}
                title={liked ? 'Unlike' : 'Like'}
              >
                <IconHeart filled={liked} size={16} />
                {likes > 0 && <span>{likes}</span>}
              </button>

              {isAdmin && (
                <div className={styles.adminActions}>
                  <button
                    className={styles.adminBtn}
                    title={item.IsHidden ? 'Show kudos' : 'Hide kudos'}
                    onClick={() => { onHide?.(item.Id, !item.IsHidden); setShowPopover(false); }}
                  >
                    {item.IsHidden ? <IconEye /> : <IconEyeOff />}
                  </button>
                  <button
                    className={`${styles.adminBtn} ${styles.deleteBtn}`}
                    title="Delete kudos"
                    onClick={() => { onDelete?.(item.Id); setShowPopover(false); }}
                  >
                    <IconTrash />
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default KudosCard;

import * as React from 'react';
import styles from './Kudos.module.scss';
import { IKudosItem } from '../../../models/IKudosItem';
import { KudosService } from '../../../services/KudosService';
import { useWebPartContext } from '../../../context/WebPartContext';

const KudosCard: React.FC<{ item: IKudosItem }> = ({ item }) => {
  const { sp, listNames } = useWebPartContext();
  const [likes, setLikes] = React.useState(0);
  const [liked, setLiked] = React.useState(false);

  const handleLike = async (): Promise<void> => {
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

  return (
    <div className={styles.kudosCard}>
      <div className={styles.kudosAvatar}>
        {item.ProfileImage ? <img src={item.ProfileImage} alt="" /> : <span>👤</span>}
      </div>
      <div className={styles.kudosContent}>
        <div className={styles.kudosHeader}>
          <strong>{item.GivenBy?.Title || 'Someone'}</strong>
          <span className={styles.kudosTime}>{timeAgo(item.Created)}</span>
        </div>
        <p className={styles.kudosMsg}>{item.Title}</p>
        <span className={styles.kudosRecipient}>{item.Recipient?.Title}</span>
      </div>
      <button className={`${styles.likeBtn} ${liked ? styles.liked : ''}`} onClick={handleLike}>
        ❤️ {likes}
      </button>
    </div>
  );
};

export default KudosCard;

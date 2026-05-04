import * as React from 'react';
import Modal from '../../common/Modal';
import { IAnnouncementItem } from '../../../models/IAnnouncementItem';

interface IAnnouncementDetailModalProps {
  item: IAnnouncementItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const AnnouncementDetailModal: React.FC<IAnnouncementDetailModalProps> = ({ item, isOpen, onClose }) => {
  if (!item) return null;

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.Title} size="medium">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {item.Image && (
          <div style={{ borderRadius: 12, overflow: 'hidden' }}>
            <img src={item.Image} alt={item.Title} style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: '#eff6ff', color: '#2563eb',
          }}>
            {item.Category}
          </span>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {formatDate(item.Created)} · by {item.Author?.Title || 'Admin'}
          </span>
        </div>
        <div
          style={{ fontSize: 15, lineHeight: 1.7, color: '#1e293b' }}
          dangerouslySetInnerHTML={{ __html: item.Description }}
        />
      </div>
    </Modal>
  );
};

export default AnnouncementDetailModal;

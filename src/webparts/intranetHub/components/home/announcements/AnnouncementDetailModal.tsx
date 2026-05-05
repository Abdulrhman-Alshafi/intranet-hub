import * as React from 'react';
import Modal from '../../common/Modal';
import { IAnnouncementItem, CATEGORY_COLORS } from '../../../models/IAnnouncementItem';

const IconPin: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
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
const IconTrash: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

interface IAnnouncementDetailModalProps {
  item: IAnnouncementItem | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onPin?: (id: number, pinned: boolean) => void;
  onHide?: (id: number, hidden: boolean) => void;
  onDelete?: (id: number) => void;
}

const AnnouncementDetailModal: React.FC<IAnnouncementDetailModalProps> = ({ item, isOpen, onClose, isAdmin, onPin, onHide, onDelete }) => {
  if (!item) return null;

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const color = CATEGORY_COLORS[item.Category] || '#6b7280';

  const adminBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer',
    borderRadius: 8, color: '#94a3b8',
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
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${color}18`, color }}>
            {item.Category}
          </span>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {formatDate(item.Created)} · by {item.Author?.Title || 'Admin'}
          </span>
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.7, color: '#1e293b' }} dangerouslySetInnerHTML={{ __html: item.Description }} />

        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Admin actions</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                style={adminBtnStyle}
                title={item.IsPinned ? 'Unpin' : 'Pin'}
                onClick={() => onPin?.(item.Id, !item.IsPinned)}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.color = '#d97706'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
              >
                <IconPin filled={item.IsPinned} />
              </button>
              <button
                style={adminBtnStyle}
                title={item.IsHidden ? 'Show' : 'Hide'}
                onClick={() => { onHide?.(item.Id, !item.IsHidden); onClose(); }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.color = '#334155'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
              >
                {item.IsHidden ? <IconEye /> : <IconEyeOff />}
              </button>
              <button
                style={adminBtnStyle}
                title="Delete announcement"
                onClick={() => { onDelete?.(item.Id); onClose(); }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
              >
                <IconTrash />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AnnouncementDetailModal;


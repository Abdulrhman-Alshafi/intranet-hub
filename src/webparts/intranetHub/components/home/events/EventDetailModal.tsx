import * as React from 'react';
import Modal from '../../common/Modal';
import { IEventItem, EVENT_CATEGORY_COLORS } from '../../../models/IEventItem';

interface IProps {
  event: IEventItem;
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailModal: React.FC<IProps> = ({ event, isOpen, onClose }) => {
  const color = EVENT_CATEGORY_COLORS[event.Category || 'Company'] || '#3b82f6';
  const fmtDate = (d: string): string => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const fmtTime = (d: string): string => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.Title} size="medium">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {event.Category && (
          <span style={{ alignSelf: 'flex-start', fontSize: 12, padding: '3px 10px', borderRadius: 10, background: `${color}15`, color, fontWeight: 600 }}>
            {event.Category}
          </span>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#94a3b8', width: 64, flexShrink: 0 }}>Starts</span>
            <span style={{ fontSize: 14, color: '#0f172a' }}>{fmtDate(event.EventDate)} · {fmtTime(event.EventDate)}</span>
          </div>
          {event.EndDate && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#94a3b8', width: 64, flexShrink: 0 }}>Ends</span>
              <span style={{ fontSize: 14, color: '#0f172a' }}>{fmtDate(event.EndDate)} · {fmtTime(event.EndDate)}</span>
            </div>
          )}
          {event.Location && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#94a3b8', width: 64, flexShrink: 0 }}>Location</span>
              <span style={{ fontSize: 14, color: '#0f172a' }}>📍 {event.Location}</span>
            </div>
          )}
        </div>
        {event.Description && (
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
            <p style={{ fontSize: 14, color: '#475569', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{event.Description}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EventDetailModal;

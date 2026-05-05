import * as React from 'react';
import Modal from '../../common/Modal';
import { useWebPartContext } from '../../../context/WebPartContext';
import { EventsService } from '../../../services/EventsService';
import { EVENT_CATEGORIES } from '../../../models/IEventItem';

interface IProps { isOpen: boolean; onClose: () => void; onAdded: () => void; }

const AddEventModal: React.FC<IProps> = ({ isOpen, onClose, onAdded }) => {
  const { sp, listNames } = useWebPartContext();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [eventDate, setEventDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [category, setCategory] = React.useState('Company');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  const handleSubmit = async (): Promise<void> => {
    if (!title.trim() || !eventDate) { setSubmitError('Title and Start Date are required.'); return; }
    if (!sp) { setSubmitError('Connection not ready, please try again.'); return; }
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const svc = new EventsService(sp, listNames.events);
      await svc.addEvent({ Title: title, Description: description, EventDate: new Date(eventDate).toISOString(), EndDate: endDate ? new Date(endDate).toISOString() : undefined, Location: location, Category: category });
      setTitle(''); setDescription(''); setEventDate(''); setEndDate(''); setLocation('');
      onAdded(); onClose();
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to add event. Please try again.');
    } finally { setIsSubmitting(false); }
  };

  const f: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, background: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const l: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#334155' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Event" size="medium">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label style={l}>Title *</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} style={f} placeholder="Event name" /></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><label style={l}>Start Date *</label><input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} style={f} /></div>
          <div style={{ flex: 1 }}><label style={l}>End Date</label><input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} style={f} /></div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><label style={l}>Location</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} style={f} placeholder="Venue or link" /></div>
          <div style={{ flex: 1 }}><label style={l}>Category</label><select value={category} onChange={e => setCategory(e.target.value)} style={f}>{EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>
        <div><label style={l}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...f, minHeight: 80 }} placeholder="Event details" /></div>
        {submitError && <p style={{ margin: 0, fontSize: 13, color: '#dc2626', padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>{submitError}</p>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting} style={{ padding: '10px 24px', border: 'none', borderRadius: 10, background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'Adding...' : 'Add Event'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddEventModal;

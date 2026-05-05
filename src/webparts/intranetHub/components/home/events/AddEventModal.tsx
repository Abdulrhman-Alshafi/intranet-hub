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
  const [startDate, setStartDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [endDate, setEndDate] = React.useState('');
  const [endTime, setEndTime] = React.useState('10:00');
  const [location, setLocation] = React.useState('');
  const [category, setCategory] = React.useState('Company');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  const buildISO = (date: string, time: string): string => {
    return new Date(`${date}T${time}:00`).toISOString();
  };

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    console.log('[AddEvent] handleSubmit called', { title, startDate, startTime, sp: !!sp });

    if (!title.trim()) { setSubmitError('Title is required.'); return; }
    if (!startDate) { setSubmitError('Start Date is required.'); return; }
    if (!sp) { setSubmitError('SharePoint connection not ready. Please close and reopen the modal.'); return; }

    setSubmitError('');
    setIsSubmitting(true);
    try {
      const svc = new EventsService(sp, listNames.events);
      const payload = {
        Title: title.trim(),
        Description: description,
        EventDate: buildISO(startDate, startTime),
        EndDate: endDate ? buildISO(endDate, endTime) : undefined,
        Location: location,
        Category: category,
      };
      console.log('[AddEvent] Sending payload:', JSON.stringify(payload));
      await svc.addEvent(payload);
      console.log('[AddEvent] Event added successfully');
      setTitle(''); setDescription(''); setStartDate(''); setStartTime('09:00');
      setEndDate(''); setEndTime('10:00'); setLocation('');
      onAdded();
      onClose();
    } catch (err) {
      console.error('[AddEvent] Error:', err);
      setSubmitError((err as Error).message || 'Failed to add event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const f: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, background: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const l: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#334155' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Event" size="medium">
      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {submitError && (
          <p style={{ margin: 0, fontSize: 13, color: '#dc2626', padding: '10px 14px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
            ⚠ {submitError}
          </p>
        )}
        <div><label style={l}>Title *</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} style={f} placeholder="Event name" /></div>

        {/* Start Date & Time - separate inputs for SPFx compatibility */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><label style={l}>Start Date *</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={f} /></div>
          <div style={{ flex: 1 }}><label style={l}>Start Time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={f} /></div>
        </div>

        {/* End Date & Time */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><label style={l}>End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={f} /></div>
          <div style={{ flex: 1 }}><label style={l}>End Time</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={f} /></div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><label style={l}>Location</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} style={f} placeholder="Venue or link" /></div>
          <div style={{ flex: 1 }}><label style={l}>Category</label><select value={category} onChange={e => setCategory(e.target.value)} style={f}>{EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>
        <div><label style={l}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...f, minHeight: 80 }} placeholder="Event details" /></div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 24px', border: 'none', borderRadius: 10, background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'Adding...' : 'Add Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEventModal;

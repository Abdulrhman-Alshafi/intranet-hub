import * as React from 'react';
import Modal from '../../common/Modal';
import { useWebPartContext } from '../../../context/WebPartContext';
import { EventsService } from '../../../services/EventsService';
import { EVENT_CATEGORIES } from '../../../models/IEventItem';
import styles from './AddEventModal.module.scss';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Event" size="medium">
      <form onSubmit={handleSubmit} className={styles.form}>
        {submitError && (
          <p className={styles.error}>
            ⚠ {submitError}
          </p>
        )}
        
        <div>
          <label className={styles.label}>Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={styles.input} placeholder="Event name" />
        </div>

        {/* Start Date & Time - separate inputs for SPFx compatibility */}
        <div className={styles.row}>
          <div className={styles.col}>
            <label className={styles.label}>Start Date *</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={styles.input} />
          </div>
          <div className={styles.col}>
            <label className={styles.label}>Start Time</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={styles.input} />
          </div>
        </div>

        {/* End Date & Time */}
        <div className={styles.row}>
          <div className={styles.col}>
            <label className={styles.label}>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={styles.input} />
          </div>
          <div className={styles.col}>
            <label className={styles.label}>End Time</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={styles.input} />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.col}>
            <label className={styles.label}>Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={styles.input} placeholder="Venue or link" />
          </div>
          <div className={styles.col}>
            <label className={styles.label}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={styles.input}>
              {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label className={styles.label}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${styles.input} ${styles.textarea}`} placeholder="Event details" />
        </div>
        
        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? 'Adding...' : 'Add Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEventModal;


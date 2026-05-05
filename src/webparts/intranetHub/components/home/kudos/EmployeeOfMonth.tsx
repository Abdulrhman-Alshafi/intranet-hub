import * as React from 'react';
import Modal from '../../common/Modal';
import styles from './Kudos.module.scss';
import { IEmployeeOfMonthItem } from '../../../models/IEmployeeOfMonthItem';

const IconPerson: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
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

interface IProps {
  item: IEmployeeOfMonthItem;
  siteUrl: string;
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
  onHide?: (id: number, hidden: boolean) => void;
}

const EmployeeOfMonth: React.FC<IProps> = ({ item, siteUrl, isAdmin, onDelete, onHide }) => {
  const [imgError, setImgError] = React.useState(false);
  const [showPopover, setShowPopover] = React.useState(false);

  const photoUrl = React.useMemo((): string | null => {
    if (imgError) return null;
    if (item.Employee?.EMail) {
      return `${siteUrl}/_layouts/15/userphoto.aspx?size=L&accountname=${encodeURIComponent(item.Employee.EMail)}`;
    }
    return null;
  }, [item.Employee, siteUrl, imgError]);

  const monthLabel = React.useMemo((): string => {
    if (!item.Month) return '';
    const [year, month] = item.Month.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [item.Month]);

  const smallAvatar = (
    <div className={styles.eomAvatar}>
      {photoUrl
        ? <img src={photoUrl} alt={item.Employee?.Title || ''} onError={() => setImgError(true)} />
        : <span style={{ color: '#d97706' }}><IconPerson /></span>
      }
    </div>
  );

  const largeAvatar = (
    <div className={styles.eomPopoverAvatar}>
      {photoUrl
        ? <img src={photoUrl} alt={item.Employee?.Title || ''} onError={() => setImgError(true)} />
        : <span style={{ color: '#d97706' }}><IconPerson /></span>
      }
    </div>
  );

  return (
    <>
      <div
        className={`${styles.eomCard} ${item.IsHidden ? styles.hiddenCard : ''}`}
        onClick={() => setShowPopover(true)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setShowPopover(true)}
      >
        {smallAvatar}
        <div className={styles.eomContent} style={{ flex: 1, minWidth: 0, overflow: 'hidden', width: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Employee of the Month</div>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.Employee?.Title || 'Employee'}</div>
          {item.Notes && <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 12, color: '#64748b' }}>{item.Notes}</div>}
        </div>
      </div>

      {showPopover && (
        <Modal isOpen={showPopover} onClose={() => setShowPopover(false)} title="Employee of the Month" size="medium" transparentBackdrop>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              {largeAvatar}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.eomPopoverBadge}>Employee of the Month</div>
                <div className={styles.eomPopoverName}>{item.Employee?.Title || 'Employee'}</div>
                {monthLabel && <div className={styles.eomPopoverMonth}>{monthLabel}</div>}
              </div>
            </div>

            {item.Notes && <p className={styles.eomPopoverNotes}>{item.Notes}</p>}

            {isAdmin && (
              <div className={styles.popoverFooter}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Admin actions</span>
                <div className={styles.adminActions}>
                  <button
                    className={styles.adminBtn}
                    title={item.IsHidden ? 'Show' : 'Hide'}
                    onClick={() => { onHide?.(item.Id, !item.IsHidden); setShowPopover(false); }}
                  >
                    {item.IsHidden ? <IconEye /> : <IconEyeOff />}
                  </button>
                  <button
                    className={`${styles.adminBtn} ${styles.deleteBtn}`}
                    title="Delete"
                    onClick={() => { onDelete?.(item.Id); setShowPopover(false); }}
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default EmployeeOfMonth;


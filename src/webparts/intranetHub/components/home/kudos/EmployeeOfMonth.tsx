import * as React from 'react';
import styles from './Kudos.module.scss';
import { IEmployeeOfMonthItem } from '../../../models/IEmployeeOfMonthItem';

const IconPerson: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
  </svg>
);

interface IProps {
  item: IEmployeeOfMonthItem;
  siteUrl: string;
}

const EmployeeOfMonth: React.FC<IProps> = ({ item, siteUrl }) => {
  const [imgError, setImgError] = React.useState(false);

  const photoUrl = React.useMemo((): string | null => {
    if (imgError) return null;
    if (item.Employee?.EMail) {
      return `${siteUrl}/_layouts/15/userphoto.aspx?size=L&accountname=${encodeURIComponent(item.Employee.EMail)}`;
    }
    return null;
  }, [item.Employee, siteUrl, imgError]);

  return (
    <div className={styles.eomCard}>
      <div className={styles.eomAvatar}>
        {photoUrl
          ? <img src={photoUrl} alt={item.Employee?.Title || ''} onError={() => setImgError(true)} />
          : <span style={{ color: '#d97706' }}><IconPerson /></span>
        }
      </div>
      <div className={styles.eomContent}>
        <span className={styles.eomBadge}>Employee of the Month</span>
        <strong className={styles.eomName}>{item.Employee?.Title || 'Employee'}</strong>
        {item.Notes && <p className={styles.eomRole}>{item.Notes}</p>}
      </div>
    </div>
  );
};

export default EmployeeOfMonth;

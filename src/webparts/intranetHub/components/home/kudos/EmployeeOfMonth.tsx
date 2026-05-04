import * as React from 'react';
import styles from './Kudos.module.scss';
import { IKudosItem } from '../../../models/IKudosItem';

const EmployeeOfMonth: React.FC<{ item: IKudosItem }> = ({ item }) => (
  <div className={styles.eomSection}>
    <h4 className={styles.eomTitle}>Employee of the Month</h4>
    <div className={styles.eomCard}>
      <div className={styles.eomAvatar}>
        {item.ProfileImage ? <img src={item.ProfileImage} alt={item.Recipient?.Title} /> : <span>🏆</span>}
      </div>
      <h3 className={styles.eomName}>{item.Recipient?.Title || 'Employee'}</h3>
      <p className={styles.eomRole}>{item.Title}</p>
    </div>
  </div>
);

export default EmployeeOfMonth;

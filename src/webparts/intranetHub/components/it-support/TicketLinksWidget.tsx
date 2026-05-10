import * as React from 'react';
import styles from './TicketLinksWidget.module.scss';
import { useWebPartContext } from '../../context/WebPartContext';

const TicketLinksWidget: React.FC = () => {
  const { itSupportConfig } = useWebPartContext();

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h2 className={styles.title}>Submit a Ticket</h2>
      </div>
      <div className={styles.content}>
        <p className={styles.description}>
          Use the links below to create a new support ticket or check the status of your existing requests. Our IT team is dedicated to responding to all inquiries within 24 hours.
        </p>
        <div className={styles.buttonsRow}>
          <a 
            href={itSupportConfig.ticketLinkAddUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`${styles.linkBtn} ${styles.primaryBtn}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {itSupportConfig.ticketLinkAddTitle || 'Add Ticket'}
          </a>
          <a 
            href={itSupportConfig.ticketLinkAllUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`${styles.linkBtn} ${styles.secondaryBtn}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            {itSupportConfig.ticketLinkAllTitle || 'See All Tickets'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default TicketLinksWidget;

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Sidebar.module.scss';
import { ISidebarLink, DEFAULT_SIDEBAR_LINKS } from '../../models/ISidebarLink';

interface ISidebarProps {
  links?: ISidebarLink[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10L10 3L17 10M5 8.5V16C5 16.55 5.45 17 6 17H8.5V12.5H11.5V17H14C14.55 17 15 16.55 15 16V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Desktop: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M7 16H13M10 13V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
  People: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2 16C2 13.79 3.79 12 6 12H8C10.21 12 12 13.79 12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="13" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M14 12C16.21 12 18 13.79 18 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
  Code: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 5L3 10L7 15M13 5L17 10L13 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Calculator: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 7H13M7 10.5H9M11 10.5H13M7 13.5H9M11 13.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
  Megaphone: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 3L7 7H4C3.45 7 3 7.45 3 8V12C3 12.55 3.45 13 4 13H7L15 17V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M17 8C17.5 8.83 17.5 11.17 17 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
};

const Sidebar: React.FC<ISidebarProps> = ({ links, activeTab, onTabChange, isCollapsed, onToggleCollapse }) => {
  const sidebarLinks = links && links.length > 0 ? links : DEFAULT_SIDEBAR_LINKS;

  return (
    <motion.nav
      className={styles.sidebar}
      animate={{ width: isCollapsed ? 60 : 220 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <button className={styles.toggleBtn} onClick={onToggleCollapse} aria-label="Toggle sidebar">
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </button>

      <div className={styles.links}>
        {sidebarLinks.sort((a, b) => a.order - b.order).map((link) => (
          <motion.button
            key={link.id}
            className={`${styles.linkBtn} ${activeTab === link.tabKey ? styles.active : ''}`}
            onClick={() => onTabChange(link.tabKey)}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            title={isCollapsed ? link.title : undefined}
          >
            <span className={styles.icon}>
              {link.imageUrl ? (
                <img src={link.imageUrl} alt={link.title} style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} />
              ) : (
                ICON_MAP[link.iconName] || ICON_MAP.Home
              )}
            </span>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  className={styles.label}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {link.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
};

export default Sidebar;

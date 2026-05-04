import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './IntranetHub.module.scss';
import { SPFI } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IntranetHubContext, IWebPartContextValue } from '../context/WebPartContext';
import { useRole } from '../hooks/useRole';
import { useViewportHeight } from '../hooks/useViewportHeight';
import { ISidebarLink } from '../models/ISidebarLink';
import Sidebar from './sidebar/Sidebar';
import AgentPanel from './agent/AgentPanel';
import HomePage from './home/HomePage';
import ComingSoon from './comingsoon/ComingSoon';

export interface IIntranetHubProps {
  sp: SPFI | null;
  wpContext: WebPartContext | null;
  currentUserId: number;
  listNames: {
    announcements: string;
    kudos: string;
    kudosLikes: string;
    polls: string;
    events: string;
    employeeOfMonth: string;
  };
  widgetDescriptions: {
    announcements: string;
    recognitionWall: string;
    polls: string;
    events: string;
  };
  sidebarLinks: ISidebarLink[];
  domElement: HTMLElement | null;
}

const TAB_NAMES: Record<string, string> = {
  'home': 'Home',
  'it-support': 'IT Support',
  'hr': 'HR',
  'developers': 'Developers',
  'accounting': 'Accounting',
  'marketing': 'Marketing',
};

const IntranetHub: React.FC<IIntranetHubProps> = (props) => {
  const { sp, wpContext, currentUserId, listNames, widgetDescriptions, sidebarLinks, domElement } = props;
  const [activeTab, setActiveTab] = React.useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const { role, isLoading: isRoleLoading } = useRole(sp);
  const viewportHeight = useViewportHeight(domElement);

  const contextValue: IWebPartContextValue = React.useMemo(() => ({
    sp,
    wpContext,
    userRole: role,
    currentUserId,
    isRoleLoading,
    listNames,
    widgetDescriptions,
  }), [sp, wpContext, role, currentUserId, isRoleLoading, listNames, widgetDescriptions]);

  const renderContent = (): React.ReactNode => {
    if (activeTab === 'home') {
      return <HomePage />;
    }
    return <ComingSoon tabName={TAB_NAMES[activeTab] || activeTab} />;
  };

  return (
    <IntranetHubContext.Provider value={contextValue}>
      <div className={styles.root} style={{ height: viewportHeight }}>
        <Sidebar
          links={sidebarLinks}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className={styles.mainContent}>
          <AnimatePresence exitBeforeEnter>
            <motion.div
              key={activeTab}
              className={styles.pageContent}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
        <aside className={styles.agentSide}>
          <AgentPanel />
        </aside>
      </div>
    </IntranetHubContext.Provider>
  );
};

export default IntranetHub;

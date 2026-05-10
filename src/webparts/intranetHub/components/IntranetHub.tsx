import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './IntranetHub.module.scss';
import { SPFI } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { AadHttpClientFactory } from '@microsoft/sp-http';
import { IntranetHubContext, IWebPartContextValue } from '../context/WebPartContext';
import { useRole } from '../hooks/useRole';
import { useViewportHeight } from '../hooks/useViewportHeight';
import { ISidebarLink } from '../models/ISidebarLink';
import Sidebar from './sidebar/Sidebar';
import AgentPanel from './agent/AgentPanel';
import HomePage from './home/HomePage';
import ComingSoon from './comingsoon/ComingSoon';
import ITSupportPage from './it-support/ITSupportPage';

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
    helpDeskTeam: string;
    helpDeskFaqs: string;
  };
  widgetDescriptions: {
    announcements: string;
    recognitionWall: string;
    polls: string;
    events: string;
  };
  agentBackendUrl: string;
  agentBackendClientId: string;
  aadHttpClientFactory?: AadHttpClientFactory;
  sidebarLinks: ISidebarLink[];
  ticketLinkAddUrl: string;
  ticketLinkAddTitle: string;
  ticketLinkAllUrl: string;
  ticketLinkAllTitle: string;
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
  const { sp, wpContext, currentUserId, listNames, widgetDescriptions, agentBackendUrl, agentBackendClientId, aadHttpClientFactory, sidebarLinks, ticketLinkAddUrl, ticketLinkAddTitle, ticketLinkAllUrl, ticketLinkAllTitle, domElement } = props;

  const siteId = wpContext?.pageContext?.site?.id?.toString() || '';
  const siteUrl = wpContext?.pageContext?.site?.absoluteUrl || '';
  const siteName = wpContext?.pageContext?.web?.title || '';
  const pageUrl = wpContext?.pageContext?.legacyPageContext?.['serverRequestPath'] || '';
  const pageTitle = wpContext?.pageContext?.legacyPageContext?.['pageTitle'] || '';
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
    itSupportConfig: {
      ticketLinkAddUrl,
      ticketLinkAddTitle,
      ticketLinkAllUrl,
      ticketLinkAllTitle,
    }
  }), [sp, wpContext, role, currentUserId, isRoleLoading, listNames, widgetDescriptions, ticketLinkAddUrl, ticketLinkAddTitle, ticketLinkAllUrl, ticketLinkAllTitle]);

  const renderContent = (): React.ReactNode => {
    const tabLower = activeTab.toLowerCase();
    if (tabLower === 'home') {
      return <HomePage />;
    }
    /* if (tabLower === 'it-support' || tabLower === 'itsupport' || tabLower === 'it support') {
      return <ITSupportPage />;
    } */
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
          <AgentPanel
            backendUrl={agentBackendUrl}
            backendClientId={agentBackendClientId}
            aadHttpClientFactory={aadHttpClientFactory}
            siteId={siteId}
            siteUrl={siteUrl}
            siteName={siteName}
            pageUrl={pageUrl}
            pageTitle={pageTitle}
          />
        </aside>
      </div>
    </IntranetHubContext.Provider>
  );
};

export default IntranetHub;

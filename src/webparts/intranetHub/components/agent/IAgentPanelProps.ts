import { AadHttpClientFactory } from '@microsoft/sp-http';

export interface IAgentPanelProps {
  backendUrl: string;
  backendClientId: string;
  aadHttpClientFactory?: AadHttpClientFactory;
  // SharePoint context fields (from pageContext)
  siteId: string;
  siteUrl: string;
  siteName: string;
  pageUrl: string;
  pageTitle: string;
}

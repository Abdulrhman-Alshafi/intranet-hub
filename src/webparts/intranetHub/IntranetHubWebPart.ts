import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { AadHttpClientFactory } from '@microsoft/sp-http';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { spfi, SPFx } from '@pnp/sp';
import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/site-users/web';

import IntranetHub, { IIntranetHubProps } from './components/IntranetHub';
import { ListProvisioner } from './services/ListProvisioner';
import { ISidebarLink, DEFAULT_SIDEBAR_LINKS } from './models/ISidebarLink';

export interface IIntranetHubWebPartProps {
  // List names
  announcementsListName: string;
  kudosListName: string;
  kudosLikesListName: string;
  pollsListName: string;
  eventsListName: string;
  employeeOfMonthListName: string;
  // Widget descriptions for AI agent
  announcementsDescription: string;
  recognitionWallDescription: string;
  pollsDescription: string;
  eventsDescription: string;
  // AI Agent backend
  agentBackendUrl: string;
  agentBackendClientId: string;
  // Sidebar
  sidebarLinks: string; // JSON string of ISidebarLink[]
  // Other tabs
  itSupportEnabled: boolean;
  hrEnabled: boolean;
  developersEnabled: boolean;
  accountingEnabled: boolean;
  marketingEnabled: boolean;
  itSupportDescription: string;
  hrDescription: string;
  developersDescription: string;
  accountingDescription: string;
  marketingDescription: string;
}

export default class IntranetHubWebPart extends BaseClientSideWebPart<IIntranetHubWebPartProps> {
  private _sp: SPFI | null = null;
  private _currentUserId: number = 0;
  private _provisioned: boolean = false;

  public render(): void {
    let sidebarLinks: ISidebarLink[] = DEFAULT_SIDEBAR_LINKS;
    try {
      const parsed = JSON.parse(this.properties.sidebarLinks || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        sidebarLinks = parsed;
      }
    } catch {
      // Use defaults
    }

    const element: React.ReactElement<IIntranetHubProps> = React.createElement(
      IntranetHub,
      {
        sp: this._sp,
        wpContext: this.context,
        currentUserId: this._currentUserId,
        listNames: {
          announcements: this.properties.announcementsListName || 'Announcements',
          kudos: this.properties.kudosListName || 'Kudos',
          kudosLikes: this.properties.kudosLikesListName || 'Kudos Likes',
          polls: this.properties.pollsListName || 'Polls',
          events: this.properties.eventsListName || 'Events',
          employeeOfMonth: this.properties.employeeOfMonthListName || 'Employee of Month',
        },
        widgetDescriptions: {
          announcements: this.properties.announcementsDescription || '',
          recognitionWall: this.properties.recognitionWallDescription || '',
          polls: this.properties.pollsDescription || '',
          events: this.properties.eventsDescription || '',
        },
        agentBackendUrl: this.properties.agentBackendUrl || 'http://localhost:8000',
        agentBackendClientId: this.properties.agentBackendClientId || 'api://2e7269a2-d488-4ff7-8593-f1d3bae99893',
        aadHttpClientFactory: this.context.aadHttpClientFactory as unknown as AadHttpClientFactory,
        sidebarLinks: sidebarLinks,
        domElement: this.domElement,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();

    try {
      this._sp = spfi().using(SPFx(this.context));
      // Get current user ID
      const user = await this._sp.web.currentUser();
      this._currentUserId = user.Id;

      // Auto-provision lists
      if (!this._provisioned) {
        const provisioner = new ListProvisioner(this._sp);
        await provisioner.ensureAllLists({
          announcements: this.properties.announcementsListName || 'Announcements',
          kudos: this.properties.kudosListName || 'Kudos',
          kudosLikes: this.properties.kudosLikesListName || 'Kudos Likes',
          polls: this.properties.pollsListName || 'Polls',
          events: this.properties.eventsListName || 'Events',
          employeeOfMonth: this.properties.employeeOfMonthListName || 'Employee of Month',
        });
        this._provisioned = true;
      }
    } catch (err) {
      console.warn('[IntranetHub] Init warning (expected in workbench):', err);
    }
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;
    const { semanticColors } = currentTheme;
    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        // PAGE 1: Home Page Settings
        {
          header: { description: 'Home Page Settings' },
          groups: [
            {
              groupName: 'Used Lists / Libraries',
              groupFields: [
                PropertyPaneTextField('announcementsListName', {
                  label: 'Announcements List Name',
                  value: this.properties.announcementsListName || 'Announcements',
                }),
                PropertyPaneTextField('kudosListName', {
                  label: 'Kudos List Name',
                  value: this.properties.kudosListName || 'Kudos',
                }),
                PropertyPaneTextField('kudosLikesListName', {
                  label: 'Kudos Likes List Name',
                  value: this.properties.kudosLikesListName || 'Kudos Likes',
                }),
                PropertyPaneTextField('pollsListName', {
                  label: 'Polls List Name',
                  value: this.properties.pollsListName || 'Polls',
                }),
                PropertyPaneTextField('eventsListName', {
                  label: 'Events List Name',
                  value: this.properties.eventsListName || 'Events',
                }),
              ],
            },
            {
              groupName: 'Widget Descriptions (for AI Agent)',
              groupFields: [
                PropertyPaneTextField('announcementsDescription', {
                  label: 'Announcements Description',
                  multiline: true,
                  rows: 3,
                  description: 'Describe what announcements are for so the AI agent understands.',
                }),
                PropertyPaneTextField('recognitionWallDescription', {
                  label: 'Recognition Wall Description',
                  multiline: true,
                  rows: 3,
                  description: 'Describe what the recognition wall is for.',
                }),
                PropertyPaneTextField('pollsDescription', {
                  label: 'Polls Description',
                  multiline: true,
                  rows: 3,
                  description: 'Describe what polls are for.',
                }),
                PropertyPaneTextField('eventsDescription', {
                  label: 'Events Description',
                  multiline: true,
                  rows: 3,
                  description: 'Describe what events are for.',
                }),
              ],
            },
            {
              groupName: 'Sidebar Configuration',
              groupFields: [
                PropertyPaneTextField('sidebarLinks', {
                  label: 'Sidebar Links (JSON)',
                  multiline: true,
                  rows: 6,
                  description: 'JSON array of sidebar links. Each item: {id, title, iconName, tabKey, order, imageUrl?}',
                }),
              ],
            },
          ],
        },
        // PAGE 2: AI Agent Settings
        {
          header: { description: 'AI Agent Settings' },
          groups: [
            {
              groupName: 'Backend Configuration',
              groupFields: [
                PropertyPaneTextField('agentBackendUrl', {
                  label: 'Backend URL',
                  description: 'Base URL of the AI agent FastAPI backend (e.g. http://localhost:8000)',
                  value: this.properties.agentBackendUrl || 'http://localhost:8000',
                }),
                PropertyPaneTextField('agentBackendClientId', {
                  label: 'Backend App Registration Client ID',
                  description: 'Client ID of the Azure AD App Registration (e.g. api://2e7269a2-d488-4ff7-8593-f1d3bae99893)',
                  value: this.properties.agentBackendClientId || 'api://2e7269a2-d488-4ff7-8593-f1d3bae99893',
                }),
              ],
            },
          ],
        },
        // PAGE 3: IT Support Settings
        {
          header: { description: 'IT Support Settings' },
          groups: [
            {
              groupName: 'IT Support Configuration',
              groupFields: [
                PropertyPaneToggle('itSupportEnabled', {
                  label: 'Enable IT Support Tab',
                  checked: this.properties.itSupportEnabled !== false,
                }),
                PropertyPaneTextField('itSupportDescription', {
                  label: 'Tab Description',
                  multiline: true,
                  rows: 3,
                }),
              ],
            },
          ],
        },
        // PAGE 4: HR Settings
        {
          header: { description: 'HR Settings' },
          groups: [
            {
              groupName: 'HR Configuration',
              groupFields: [
                PropertyPaneToggle('hrEnabled', {
                  label: 'Enable HR Tab',
                  checked: this.properties.hrEnabled !== false,
                }),
                PropertyPaneTextField('hrDescription', {
                  label: 'Tab Description',
                  multiline: true,
                  rows: 3,
                }),
              ],
            },
          ],
        },
        // PAGE 5: Developers Settings
        {
          header: { description: 'Developers Settings' },
          groups: [
            {
              groupName: 'Developers Configuration',
              groupFields: [
                PropertyPaneToggle('developersEnabled', {
                  label: 'Enable Developers Tab',
                  checked: this.properties.developersEnabled !== false,
                }),
                PropertyPaneTextField('developersDescription', {
                  label: 'Tab Description',
                  multiline: true,
                  rows: 3,
                }),
              ],
            },
          ],
        },
        // PAGE 6: Accounting Settings
        {
          header: { description: 'Accounting Settings' },
          groups: [
            {
              groupName: 'Accounting Configuration',
              groupFields: [
                PropertyPaneToggle('accountingEnabled', {
                  label: 'Enable Accounting Tab',
                  checked: this.properties.accountingEnabled !== false,
                }),
                PropertyPaneTextField('accountingDescription', {
                  label: 'Tab Description',
                  multiline: true,
                  rows: 3,
                }),
              ],
            },
          ],
        },
        // PAGE 7: Marketing Settings
        {
          header: { description: 'Marketing Settings' },
          groups: [
            {
              groupName: 'Marketing Configuration',
              groupFields: [
                PropertyPaneToggle('marketingEnabled', {
                  label: 'Enable Marketing Tab',
                  checked: this.properties.marketingEnabled !== false,
                }),
                PropertyPaneTextField('marketingDescription', {
                  label: 'Tab Description',
                  multiline: true,
                  rows: 3,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}

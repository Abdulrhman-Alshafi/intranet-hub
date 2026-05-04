import * as React from 'react';
import { SPFI } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { UserRole } from '../utils/roleUtils';

export interface IWebPartContextValue {
  sp: SPFI | null;
  wpContext: WebPartContext | null;
  userRole: UserRole;
  currentUserId: number;
  isRoleLoading: boolean;
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
}

const defaultContextValue: IWebPartContextValue = {
  sp: null,
  wpContext: null,
  userRole: UserRole.User,
  currentUserId: 0,
  isRoleLoading: true,
  listNames: {
    announcements: 'Announcements',
    kudos: 'Kudos',
    kudosLikes: 'Kudos Likes',
    polls: 'Polls',
    events: 'Events',
    employeeOfMonth: 'Employee of Month',
  },
  widgetDescriptions: {
    announcements: '',
    recognitionWall: '',
    polls: '',
    events: '',
  },
};

export const IntranetHubContext = React.createContext<IWebPartContextValue>(defaultContextValue);

export const useWebPartContext = (): IWebPartContextValue => {
  return React.useContext(IntranetHubContext);
};

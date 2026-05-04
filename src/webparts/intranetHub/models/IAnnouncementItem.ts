export interface IAnnouncementItem {
  Id: number;
  Title: string;
  Description: string;
  Category: string;
  Image?: string;
  IsPinned: boolean;
  IsHidden: boolean;
  AuthorId: number;
  Author?: { Title: string; EMail: string };
  Created: string;
}

export const ANNOUNCEMENT_CATEGORIES = [
  'All', 'Company', 'HR', 'IT', 'Facilities', 'Sales', 'Events'
];

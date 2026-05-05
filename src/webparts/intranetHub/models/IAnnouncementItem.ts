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
  'All', 'Company', 'HR', 'IT', 'Facilities', 'Sales', 'Events', 'Press Release'
];

export const CATEGORY_COLORS: Record<string, string> = {
  Company: '#2563eb',
  HR: '#dc2626',
  IT: '#059669',
  Facilities: '#d97706',
  Sales: '#7c3aed',
  Events: '#0891b2',
  'Press Release': '#be185d',
};

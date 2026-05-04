export interface ISidebarLink {
  id: string;
  title: string;
  iconName: string;
  imageUrl?: string;
  tabKey: string;
  order: number;
}

export const DEFAULT_SIDEBAR_LINKS: ISidebarLink[] = [
  { id: '1', title: 'Home', iconName: 'Home', tabKey: 'home', order: 0 },
  { id: '2', title: 'IT Support', iconName: 'Desktop', tabKey: 'it-support', order: 1 },
  { id: '3', title: 'HR', iconName: 'People', tabKey: 'hr', order: 2 },
  { id: '4', title: 'Developers', iconName: 'Code', tabKey: 'developers', order: 3 },
  { id: '5', title: 'Accounting', iconName: 'Calculator', tabKey: 'accounting', order: 4 },
  { id: '6', title: 'Marketing', iconName: 'Megaphone', tabKey: 'marketing', order: 5 },
];

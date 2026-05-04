import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IEmployeeOfMonthItem } from '../models/IEmployeeOfMonthItem';

export class EmployeeOfMonthService {
  private sp: SPFI;
  private listName: string;

  constructor(sp: SPFI, listName: string) {
    this.sp = sp;
    this.listName = listName;
  }

  public async getCurrentEOM(): Promise<IEmployeeOfMonthItem | undefined> {
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-05"
    const items = await this.sp.web.lists.getByTitle(this.listName).items
      .select('Id', 'EmployeeId', 'Employee/Title', 'Employee/EMail', 'Employee/Id', 'Month', 'Notes', 'Created')
      .expand('Employee')
      .filter(`Month eq '${currentMonth}'`)
      .orderBy('Created', false)
      .top(1)();
    return items.length > 0 ? items[0] as IEmployeeOfMonthItem : undefined;
  }

  public async setEOM(employeeId: number, notes?: string): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    await this.sp.web.lists.getByTitle(this.listName).items.add({
      Title: `EOM-${currentMonth}`,
      EmployeeId: employeeId,
      Month: currentMonth,
      Notes: notes || '',
    });
  }
}

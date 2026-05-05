import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IEventItem } from '../models/IEventItem';

export class EventsService {
  private sp: SPFI;
  private listName: string;

  constructor(sp: SPFI, listName: string) {
    this.sp = sp;
    this.listName = listName;
  }

  public async getUpcomingEvents(top: number = 5): Promise<IEventItem[]> {
    const now = new Date().toISOString();
    const items = await this.sp.web.lists.getByTitle(this.listName).items
      .select('Id', 'Title', 'Description', 'EventDate', 'EndDate', 'Location', 'Category', 'Image', 'Created')
      .filter(`EventDate ge datetime'${now}'`)
      .orderBy('EventDate', true)
      .top(top)();

    return items as IEventItem[];
  }

  public async getAllEvents(): Promise<IEventItem[]> {
    const items = await this.sp.web.lists.getByTitle(this.listName).items
      .select('Id', 'Title', 'Description', 'EventDate', 'EndDate', 'Location', 'Category', 'Image', 'Created')
      .orderBy('EventDate', false)
      .top(200)();

    return items as IEventItem[];
  }

  public async addEvent(data: {
    Title: string;
    Description?: string;
    EventDate: string;
    EndDate?: string;
    Location?: string;
    Category?: string;
    Image?: string;
  }): Promise<void> {
    await this.sp.web.lists.getByTitle(this.listName).items.add({
      Title: data.Title,
      Description: data.Description || '',
      EventDate: data.EventDate,
      ...(data.EndDate ? { EndDate: data.EndDate } : {}),
      Location: data.Location || '',
      Category: data.Category || 'Company',
      Image: data.Image || '',
    });
  }

  public async deleteEvent(id: number): Promise<void> {
    await this.sp.web.lists.getByTitle(this.listName).items.getById(id).recycle();
  }
}

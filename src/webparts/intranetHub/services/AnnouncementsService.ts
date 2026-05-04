import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import { IAnnouncementItem } from '../models/IAnnouncementItem';

export class AnnouncementsService {
  private sp: SPFI;
  private listName: string;

  constructor(sp: SPFI, listName: string) {
    this.sp = sp;
    this.listName = listName;
  }

  public async getAnnouncements(category?: string): Promise<IAnnouncementItem[]> {
    const list = this.sp.web.lists.getByTitle(this.listName);
    let filter = 'IsHidden ne 1';
    if (category && category !== 'All') {
      filter += ` and Category eq '${category}'`;
    }

    const items = await list.items
      .select('Id', 'Title', 'Description', 'Category', 'Image', 'IsPinned', 'IsHidden', 'AuthorId', 'Author/Title', 'Author/EMail', 'Created')
      .expand('Author')
      .filter(filter)
      .orderBy('IsPinned', false)
      .orderBy('Created', false)
      .top(50)();

    return items as IAnnouncementItem[];
  }

  public async getAllAnnouncements(): Promise<IAnnouncementItem[]> {
    const list = this.sp.web.lists.getByTitle(this.listName);
    const items = await list.items
      .select('Id', 'Title', 'Description', 'Category', 'Image', 'IsPinned', 'IsHidden', 'AuthorId', 'Author/Title', 'Author/EMail', 'Created')
      .expand('Author')
      .orderBy('Created', false)
      .top(200)();

    return items as IAnnouncementItem[];
  }

  public async addAnnouncement(data: { Title: string; Description: string; Category: string; Image?: string }): Promise<void> {
    await this.sp.web.lists.getByTitle(this.listName).items.add({
      Title: data.Title,
      Description: data.Description,
      Category: data.Category,
      Image: data.Image || '',
      IsPinned: false,
      IsHidden: false,
    });
  }

  public async togglePin(id: number, isPinned: boolean): Promise<void> {
    await this.sp.web.lists.getByTitle(this.listName).items.getById(id).update({
      IsPinned: isPinned,
    });
  }

  public async toggleHide(id: number, isHidden: boolean): Promise<void> {
    await this.sp.web.lists.getByTitle(this.listName).items.getById(id).update({
      IsHidden: isHidden,
    });
  }

  public async deleteAnnouncement(id: number): Promise<void> {
    await this.sp.web.lists.getByTitle(this.listName).items.getById(id).recycle();
  }
}

import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IKudosItem } from '../models/IKudosItem';
import { IKudosLikeItem } from '../models/IKudosLikeItem';

export class KudosService {
  private sp: SPFI;
  private kudosListName: string;
  private likesListName: string;

  constructor(sp: SPFI, kudosListName: string, likesListName: string) {
    this.sp = sp;
    this.kudosListName = kudosListName;
    this.likesListName = likesListName;
  }

  public async getKudos(top: number = 20): Promise<IKudosItem[]> {
    const items = await this.sp.web.lists.getByTitle(this.kudosListName).items
      .select('Id', 'Title', 'RecipientId', 'Recipient/Title', 'Recipient/EMail', 'GivenById', 'GivenBy/Title', 'GivenBy/EMail', 'IsHidden', 'ProfileImage', 'Created')
      .expand('Recipient', 'GivenBy')
      .orderBy('Created', false)
      .top(top)();

    return items as IKudosItem[];
  }

  public async addKudos(data: { Title: string; RecipientId: number }): Promise<void> {
    const currentUser = await this.sp.web.currentUser();
    await this.sp.web.lists.getByTitle(this.kudosListName).items.add({
      Title: data.Title,
      RecipientId: data.RecipientId,
      GivenById: currentUser.Id,
    });
  }

  public async getLikesForKudos(kudosId: number): Promise<IKudosLikeItem[]> {
    const items = await this.sp.web.lists.getByTitle(this.likesListName).items
      .select('Id', 'Title', 'KudosItemId', 'LikedById', 'LikedBy/Title', 'LikedBy/EMail')
      .expand('LikedBy')
      .filter(`KudosItemId eq ${kudosId}`)();

    return items as IKudosLikeItem[];
  }

  public async getLikesCountBatch(kudosIds: number[]): Promise<Record<number, number>> {
    const result: Record<number, number> = {};
    if (kudosIds.length === 0) return result;

    const allLikes = await this.sp.web.lists.getByTitle(this.likesListName).items
      .select('KudosItemId')
      .filter(kudosIds.map(id => `KudosItemId eq ${id}`).join(' or '))
      .top(5000)();

    for (const like of allLikes) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kid = (like as any).KudosItemId;
      result[kid] = (result[kid] || 0) + 1;
    }
    return result;
  }

  public async toggleLike(kudosId: number): Promise<boolean> {
    const currentUser = await this.sp.web.currentUser();
    const existing = await this.sp.web.lists.getByTitle(this.likesListName).items
      .filter(`KudosItemId eq ${kudosId} and LikedById eq ${currentUser.Id}`)
      .top(1)();

    if (existing.length > 0) {
      // Unlike
      await this.sp.web.lists.getByTitle(this.likesListName).items.getById(existing[0].Id).delete();
      return false;
    } else {
      // Like
      await this.sp.web.lists.getByTitle(this.likesListName).items.add({
        Title: `Like-${kudosId}`,
        KudosItemId: kudosId,
        LikedById: currentUser.Id,
      });
      return true;
    }
  }

  public async deleteKudos(id: number): Promise<void> {
    await this.sp.web.lists.getByTitle(this.kudosListName).items.getById(id).delete();
  }

  public async hideKudos(id: number, hidden: boolean): Promise<void> {
    await this.sp.web.lists.getByTitle(this.kudosListName).items.getById(id).update({ IsHidden: hidden });
  }

}

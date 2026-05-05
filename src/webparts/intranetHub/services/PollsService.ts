import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IPollItem, IPollOption } from '../models/IPollItem';

export class PollsService {
  private sp: SPFI;
  private listName: string;

  constructor(sp: SPFI, listName: string) {
    this.sp = sp;
    this.listName = listName;
  }

  public async getLatestPoll(): Promise<IPollItem | null> {
    // First try pinned (IsLatest=true)
    const pinned = await this.sp.web.lists.getByTitle(this.listName).items
      .select('Id', 'Title', 'Options', 'IsActive', 'IsVisible', 'IsLatest', 'TotalVotes', 'VotedUsers', 'Created')
      .filter('IsLatest eq 1 and IsVisible eq 1')
      .orderBy('Created', false)
      .top(1)();

    if (pinned.length > 0) return pinned[0] as IPollItem;

    // Fall back to newest visible poll
    const newest = await this.sp.web.lists.getByTitle(this.listName).items
      .select('Id', 'Title', 'Options', 'IsActive', 'IsVisible', 'IsLatest', 'TotalVotes', 'VotedUsers', 'Created')
      .filter('IsVisible eq 1')
      .orderBy('Created', false)
      .top(1)();

    return newest.length > 0 ? newest[0] as IPollItem : null;
  }

  public async getAllPolls(): Promise<IPollItem[]> {
    const items = await this.sp.web.lists.getByTitle(this.listName).items
      .select('Id', 'Title', 'Options', 'IsActive', 'IsVisible', 'IsLatest', 'TotalVotes', 'VotedUsers', 'Created')
      .orderBy('Created', false)
      .top(100)();

    return items as IPollItem[];
  }

  public async getUnansweredCount(userId: number): Promise<number> {
    const items = await this.sp.web.lists.getByTitle(this.listName).items
      .select('Id', 'VotedUsers', 'IsActive', 'IsVisible')
      .filter('IsActive eq 1 and IsVisible eq 1')
      .top(100)();

    let count = 0;
    for (const item of items) {
      const poll = item as IPollItem;
      try {
        const votedUsers: number[] = poll.VotedUsers ? JSON.parse(poll.VotedUsers) : [];
        if (!votedUsers.includes(userId)) {
          count++;
        }
      } catch {
        count++;
      }
    }
    return count;
  }

  public async vote(pollId: number, optionIndex: number, userId: number): Promise<void> {
    const item = await this.sp.web.lists.getByTitle(this.listName).items.getById(pollId)
      .select('Options', 'TotalVotes', 'VotedUsers')() as IPollItem;

    const options: IPollOption[] = JSON.parse(item.Options || '[]');
    const votedUsers: number[] = item.VotedUsers ? JSON.parse(item.VotedUsers) : [];

    if (votedUsers.includes(userId)) {
      return; // Already voted
    }

    if (optionIndex >= 0 && optionIndex < options.length) {
      options[optionIndex].votes++;
    }
    votedUsers.push(userId);

    await this.sp.web.lists.getByTitle(this.listName).items.getById(pollId).update({
      Options: JSON.stringify(options),
      TotalVotes: (item.TotalVotes || 0) + 1,
      VotedUsers: JSON.stringify(votedUsers),
    });
  }

  public async addPoll(data: { Title: string; Options: IPollOption[] }): Promise<void> {
    // Unpin any currently pinned poll
    const currentPinned = await this.sp.web.lists.getByTitle(this.listName).items
      .filter('IsLatest eq 1')
      .top(10)();
    for (const item of currentPinned) {
      await this.sp.web.lists.getByTitle(this.listName).items.getById(item.Id).update({ IsLatest: false });
    }

    await this.sp.web.lists.getByTitle(this.listName).items.add({
      Title: data.Title,
      Options: JSON.stringify(data.Options),
      IsActive: true,
      IsVisible: true,
      IsLatest: true,
      TotalVotes: 0,
      VotedUsers: '[]',
    });
  }

  public async setLatest(pollId: number): Promise<void> {
    // Unpin all current
    const currentLatest = await this.sp.web.lists.getByTitle(this.listName).items
      .filter('IsLatest eq 1')
      .top(10)();
    for (const item of currentLatest) {
      await this.sp.web.lists.getByTitle(this.listName).items.getById(item.Id).update({ IsLatest: false });
    }
    await this.sp.web.lists.getByTitle(this.listName).items.getById(pollId).update({ IsLatest: true });
  }

  public async clearLatest(pollId: number): Promise<void> {
    await this.sp.web.lists.getByTitle(this.listName).items.getById(pollId).update({ IsLatest: false });
  }

  public async toggleVisibility(pollId: number, isVisible: boolean): Promise<void> {
    await this.sp.web.lists.getByTitle(this.listName).items.getById(pollId).update({ IsVisible: isVisible });
  }

  public async deletePoll(pollId: number): Promise<void> {
    await this.sp.web.lists.getByTitle(this.listName).items.getById(pollId).recycle();
  }

  public async getVisibleCount(): Promise<number> {
    const items = await this.sp.web.lists.getByTitle(this.listName).items
      .select('Id')
      .filter('IsVisible eq 1')
      .top(500)();
    return items.length;
  }
}

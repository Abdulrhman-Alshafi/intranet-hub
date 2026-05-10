import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IHelpDeskFaq, IHelpDeskTeamMember } from '../models/IITSupportModels';

export class ITSupportService {
  constructor(
    private sp: SPFI,
    private faqListName: string,
    private teamListName: string
  ) {}

  // ==========================================
  // Help Desk Team
  // ==========================================
  public async getHelpDeskTeam(): Promise<IHelpDeskTeamMember[]> {
    return this.sp.web.lists.getByTitle(this.teamListName).items
      .select("Id", "Member/Id", "Member/Title", "Member/EMail", "Role")
      .expand("Member")();
  }

  public async addTeamMember(memberId: number, role?: string): Promise<void> {
    await this.sp.web.lists.getByTitle(this.teamListName).items.add({
      MemberId: memberId,
      Role: role || 'IT Support'
    });
  }

  public async removeTeamMember(id: number): Promise<void> {
    await this.sp.web.lists.getByTitle(this.teamListName).items.getById(id).delete();
  }

  // ==========================================
  // FAQs
  // ==========================================
  public async getActiveFaqs(): Promise<IHelpDeskFaq[]> {
    return this.sp.web.lists.getByTitle(this.faqListName).items
      .filter("IsActive eq 1")
      .orderBy("Order", true)();
  }

  public async addFaq(faq: Partial<IHelpDeskFaq>): Promise<void> {
    await this.sp.web.lists.getByTitle(this.faqListName).items.add(faq);
  }
}

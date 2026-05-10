export interface IHelpDeskTeamMember {
  Id: number;
  MemberId: number;
  Member?: { Title: string; EMail: string };
  Role?: string;
}

export interface IHelpDeskFaq {
  Id: number;
  Title: string;
  Question: string;
  Answer: string;
  Order?: number;
  IsActive?: boolean;
}

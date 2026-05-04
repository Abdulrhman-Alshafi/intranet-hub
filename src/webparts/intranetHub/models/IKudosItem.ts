export interface IKudosItem {
  Id: number;
  Title: string;
  RecipientId: number;
  Recipient?: { Title: string; EMail: string };
  GivenById: number;
  GivenBy?: { Title: string; EMail: string };
  IsEmployeeOfMonth: boolean;
  ProfileImage?: string;
  Created: string;
  LikesCount?: number;
  IsLikedByMe?: boolean;
}

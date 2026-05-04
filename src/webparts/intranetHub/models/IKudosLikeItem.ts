export interface IKudosLikeItem {
  Id: number;
  Title: string;
  KudosItemId: number;
  LikedById: number;
  LikedBy?: { Title: string; EMail: string };
}

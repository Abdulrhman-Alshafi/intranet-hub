export interface IPollOption {
  text: string;
  votes: number;
}

export interface IPollItem {
  Id: number;
  Title: string;
  Options: string; // JSON string of IPollOption[]
  IsActive: boolean;
  IsVisible: boolean;
  IsLatest: boolean;
  TotalVotes: number;
  VotedUsers: string; // JSON string of user IDs
  Created: string;
}

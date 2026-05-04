export interface IEmployeeOfMonthItem {
  Id: number;
  Employee?: { Title: string; EMail: string; Id: number };
  EmployeeId: number;
  Month: string; // format: YYYY-MM
  Notes?: string;
  Created: string;
}

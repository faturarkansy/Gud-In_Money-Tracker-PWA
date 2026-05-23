export interface FinanceAccount {
  id: string;
  user_id: string;
  account_name: string;
  account_type: "conventional" | "digital" | "e-wallet";
  current_balance: number;
  created_at: string;
}

export interface Action {
  id: string;
  month: string;
  title: string;
  bucket: string;
  owners: string[];
  due_date: string | null;
  status: string;
  percent_complete: number;
  priority: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  active: boolean;
  created_at: string;
}

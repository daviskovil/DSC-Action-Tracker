export const BUCKETS = [
  "Bucket 01 - AE Engagement",
  "Bucket 02 - Client Outreach",
  "Bucket 03 - Content & Assets",
] as const;

export const STATUSES = [
  "Not Started",
  "In Progress",
  "Blocked",
  "Done",
] as const;

export const PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;

export const MONTHS = ["June", "July"] as const;

export const BUCKET_COLORS: Record<string, string> = {
  "Bucket 01 - AE Engagement": "bucket1",
  "Bucket 02 - Client Outreach": "bucket2",
  "Bucket 03 - Content & Assets": "bucket3",
};

export const BUCKET_BADGE: Record<string, string> = {
  "Bucket 01 - AE Engagement":
    "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Bucket 02 - Client Outreach": "bg-sky-100 text-sky-800 border-sky-200",
  "Bucket 03 - Content & Assets":
    "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export const STATUS_COLORS: Record<string, string> = {
  "Not Started": "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Blocked: "bg-red-100 text-red-700",
  Done: "bg-green-100 text-green-700",
};

export const PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-gray-100 text-gray-600",
};

export type Bucket = (typeof BUCKETS)[number];
export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];

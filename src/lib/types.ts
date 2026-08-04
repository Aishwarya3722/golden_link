export type UserRole = "senior" | "family" | "volunteer";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface FamilyLink {
  id: string;
  senior_id: string;
  family_id: string | null;
  link_code: string;
  created_at: string;
  linked_at: string | null;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  contact_name: string;
  contact_number: string;
  created_at: string;
}

export type EmergencyStatus = "active" | "resolved" | "cancelled";

export interface EmergencyLog {
  id: string;
  user_id: string;
  status: EmergencyStatus;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  resolved_at: string | null;
}

export interface Medicine {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  days: string[];
  reminder_time: string; // "HH:MM:SS"
  active: boolean;
  created_at: string;
}

export interface MedicineHistoryEntry {
  id: string;
  medicine_id: string;
  status: "taken" | "missed" | "skipped";
  taken_at: string;
}

export type ServiceCategory =
  | "Cleaning"
  | "Fixing"
  | "Hangout"
  | "Plumbing"
  | "Electrical"
  | "Carpentry"
  | "AC Repair"
  | "Other";

export interface ServiceListing {
  id: string;
  volunteer_id: string | null;
  name: string;
  category: ServiceCategory;
  address: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  availability: string | null;
  rating_avg: number;
  created_at: string;
}

export type BookingStatus = "requested" | "confirmed" | "in_progress" | "completed" | "cancelled";

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  status: BookingStatus;
  scheduled_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: Pick<Profile, "full_name" | "avatar_url">;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  author?: Pick<Profile, "full_name" | "avatar_url">;
}

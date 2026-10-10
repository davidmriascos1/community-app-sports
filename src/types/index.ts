// Domain types. Field names match the future PostgreSQL columns (snake_case)
// so rows from Supabase can be used without a mapping layer.

export type BookingStatus = 'booked' | 'cancelled' | 'attended' | 'no_show';

export interface Gym {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  gym_id: string;
  created_at: string;
}

export interface GymClass {
  id: string;
  gym_id: string;
  name: string;
  description: string;
  coach_name: string;
  class_type: string;
  starts_at: string;
  duration_minutes: number;
  capacity: number;
  created_at: string;
}

export interface ClassBooking {
  id: string;
  class_id: string;
  user_id: string;
  status: BookingStatus;
  booked_at: string;
}

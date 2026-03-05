export type AppointmentStatus = 'agendado' | 'confirmado' | 'cancelado' | 'faltou' | 'concluido';

export interface AvailabilityRule {
  id: string;
  user_id: string;
  profissional_id: string;
  weekday: number; // 0-6 (0 = Sunday)
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  created_at?: string;
}

export interface AvailabilityException {
  id: string;
  user_id: string;
  profissional_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  reason?: string | null;
  created_at?: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  patient_id?: string | null;
  professional_id?: string | null;
  procedure_id?: string | null;
  room_id?: string | null;
  start_time: string; // ISO 8601 string containing date and time
  end_time: string; // ISO 8601 string containing date and time
  status: AppointmentStatus;
  notes?: string | null;
  created_at?: string;
  
  // Relations mapped from views/joins
  patients?: {
    name: string;
    phone?: string;
    email?: string;
  } | null;
  professionals?: {
    name: string;
    specialty?: string;
  } | null;
  procedures?: {
    name: string;
    duration_minutes: number;
    price: number;
  } | null;
}

export interface CreateAppointmentPayload {
  p_patient_id: string;
  p_profissional_id: string;
  p_start_time: string; // timestamptz ISO format
  p_end_time: string; // timestamptz ISO format
  p_notes?: string;
  p_procedure_id?: string;
  p_room_id?: string;
}

export interface RescheduleAppointmentPayload {
  p_appointment_id: string;
  p_new_start_time: string; // timestamptz ISO format
  p_new_end_time: string; // timestamptz ISO format
}

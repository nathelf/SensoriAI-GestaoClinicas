import { supabase } from "@/integrations/supabase/client";
import type {
  Appointment,
  AvailabilityRule,
  AvailabilityException,
  CreateAppointmentPayload,
  RescheduleAppointmentPayload,
} from "@/types/agenda";

export const agendaService = {
  // Config & Rules
  async getAvailabilityRules(profissionalId?: string) {
    let query = supabase.from("availability_rules").select("*");
    if (profissionalId) {
      query = query.eq("profissional_id", profissionalId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as AvailabilityRule[];
  },

  async getAvailabilityExceptions(
    profissionalId?: string,
    startDate?: string,
    endDate?: string
  ) {
    let query = supabase.from("availability_exceptions").select("*");

    if (profissionalId) {
      query = query.eq("profissional_id", profissionalId);
    }
    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as AvailabilityException[];
  },

  // Appointments
  async getAppointments(startDate: string, endDate: string, profissionalId?: string) {
    let query = supabase
      .from("appointments")
      .select(
        `
        *,
        patients (name, phone, email),
        professionals (name, specialty),
        procedures (name, duration_minutes, price)
      `
      )
      .gte("start_time", startDate)
      .lt("start_time", endDate)
      .order("start_time", { ascending: true });

    // ✅ FIX: a coluna na tabela é professional_id (não profissional_id)
    if (profissionalId) {
      query = query.eq("professional_id", profissionalId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Appointment[];
  },

  // ✅ FIX: não usa RPC, insere direto na tabela
  async createAppointment(payload: CreateAppointmentPayload) {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) throw sessionErr;

    const userId = sessionData.session?.user?.id;
    if (!userId) throw new Error("Sem sessão. Faça login novamente.");

    const insertPayload = {
      user_id: userId,
      patient_id: payload.p_patient_id || null,
      // ✅ FIX: tabela usa professional_id
      professional_id: payload.p_profissional_id || null,
      procedure_id: payload.p_procedure_id ?? null,
      room_id: payload.p_room_id ?? null,
      start_time: payload.p_start_time,
      end_time: payload.p_end_time,
      status: "agendado" as const,
      notes: payload.p_notes ?? null,
    };

    const { data, error } = await supabase
      .from("appointments")
      .insert(insertPayload)
      .select(
        `
        *,
        patients (name, phone, email),
        professionals (name, specialty),
        procedures (name, duration_minutes, price)
      `
      )
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  // ✅ FIX: reschedule sem RPC
  async rescheduleAppointment(payload: RescheduleAppointmentPayload) {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        start_time: payload.p_new_start_time,
        end_time: payload.p_new_end_time,
      })
      .eq("id", payload.p_appointment_id)
      .select(
        `
        *,
        patients (name, phone, email),
        professionals (name, specialty),
        procedures (name, duration_minutes, price)
      `
      )
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  // ✅ FIX: cancel sem RPC
  async cancelAppointment(appointmentId: string) {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "cancelado" })
      .eq("id", appointmentId)
      .select(
        `
        *,
        patients (name, phone, email),
        professionals (name, specialty),
        procedures (name, duration_minutes, price)
      `
      )
      .single();

    if (error) throw error;
    return data as Appointment;
  },
};
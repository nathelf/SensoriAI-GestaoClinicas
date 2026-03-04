import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type OnboardingTaskKey = "agendamento" | "atendimento" | "venda" | "lembretes" | "documento";

const TASK_KEYS: OnboardingTaskKey[] = ["agendamento", "atendimento", "venda", "lembretes", "documento"];
const TASK_COLUMNS: Record<OnboardingTaskKey, keyof OnboardingRow> = {
  agendamento: "task_agendamento",
  atendimento: "task_atendimento",
  venda: "task_venda",
  lembretes: "task_lembretes",
  documento: "task_documento",
};

interface OnboardingRow {
  id: string;
  user_id: string;
  task_agendamento: boolean;
  task_atendimento: boolean;
  task_venda: boolean;
  task_lembretes: boolean;
  task_documento: boolean;
  progress_percent: number;
  reward_claimed: boolean;
}

export interface OnboardingTask {
  id: number;
  key: OnboardingTaskKey;
  label: string;
  desc: string;
  done: boolean;
}

const TASK_LABELS: Record<OnboardingTaskKey, { label: string; desc: string }> = {
  agendamento: {
    label: "Criar um agendamento",
    desc: "Dê o passo inicial para ter uma agenda clara, organizada e pronta para crescer.",
  },
  atendimento: {
    label: "Realizar um atendimento",
    desc: "Execute seu primeiro atendimento para experimentar a gestão de clientes e aprimorar suas interações.",
  },
  venda: {
    label: "Fazer uma venda",
    desc: "Registre sua primeira venda para controlar o fluxo financeiro e otimizar suas operações comerciais.",
  },
  lembretes: {
    label: "Automatize seus lembretes",
    desc: "Configure lembretes automáticos para nunca mais perder um compromisso e manter sua rotina organizada.",
  },
  documento: {
    label: "Assine um documento",
    desc: "Assine seu primeiro documento digitalmente para agilizar processos e garantir a segurança das suas informações.",
  },
};

function rowToTasks(row: OnboardingRow | null): OnboardingTask[] {
  if (!row) {
    return TASK_KEYS.map((key, i) => ({
      id: i + 1,
      key,
      label: TASK_LABELS[key].label,
      desc: TASK_LABELS[key].desc,
      done: false,
    }));
  }
  return TASK_KEYS.map((key, i) => ({
    id: i + 1,
    key,
    label: TASK_LABELS[key].label,
    desc: TASK_LABELS[key].desc,
    done: Boolean(row[TASK_COLUMNS[key]]),
  }));
}

function calcProgress(row: Partial<OnboardingRow>): number {
  let count = 0;
  TASK_KEYS.forEach((k) => {
    if (row[TASK_COLUMNS[k]]) count++;
  });
  return Math.round((count / TASK_KEYS.length) * 100);
}

export function useOnboarding() {
  const { user } = useAuth();
  const [onboarding, setOnboarding] = useState<OnboardingRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOnboarding = useCallback(async () => {
    if (!user?.id) {
      setOnboarding(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("users_onboarding")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setOnboarding(data as OnboardingRow | null);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchOnboarding();
  }, [fetchOnboarding]);

  const markTaskDone = useCallback(
    async (taskKey: OnboardingTaskKey) => {
      if (!user?.id) return;
      const col = TASK_COLUMNS[taskKey];
      const current = onboarding ?? ({} as OnboardingRow);
      const alreadyDone = Boolean(current[col]);
      if (alreadyDone) return;
      const next = { ...current, [col]: true, user_id: user.id };
      const progress_percent = calcProgress(next);
      const { error } = await supabase
        .from("users_onboarding")
        .upsert(
          {
            user_id: user.id,
            task_agendamento: next.task_agendamento ?? false,
            task_atendimento: next.task_atendimento ?? false,
            task_venda: next.task_venda ?? false,
            task_lembretes: next.task_lembretes ?? false,
            task_documento: next.task_documento ?? false,
            progress_percent,
          },
          { onConflict: "user_id" }
        );
      if (!error) await fetchOnboarding();
    },
    [user?.id, onboarding, fetchOnboarding]
  );

  const tasks = rowToTasks(onboarding);
  const progress = onboarding ? onboarding.progress_percent : calcProgress(onboarding ?? {});
  const allDone = progress === 100;

  return { onboarding, tasks, progress, loading, allDone, markTaskDone, refetch: fetchOnboarding };
}

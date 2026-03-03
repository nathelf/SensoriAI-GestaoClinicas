import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface UseCrudOptions {
  table: string;
  orderBy?: string;
  ascending?: boolean;
  select?: string;
}

export function useCrud<T extends { id: string }>({ table, orderBy = "created_at", ascending = false, select = "*" }: UseCrudOptions) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const q = supabase.from(table).select(select).order(orderBy, { ascending });
    const { data: rows, error } = await q;
    if (error) { toast.error("Erro ao carregar dados"); console.error(error); }
    else setData((rows || []) as T[]);
    setLoading(false);
  }, [user, table, orderBy, ascending, select]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (item: Partial<T>) => {
    if (!user) return null;
    const payload = { ...item, user_id: user.id } as any;
    const { data: created, error } = await supabase.from(table).insert(payload).select().single();
    if (error) { toast.error("Erro ao criar"); console.error(error); return null; }
    toast.success("Criado com sucesso!");
    await fetch();
    return created as T;
  };

  const update = async (id: string, item: Partial<T>) => {
    const { error } = await supabase.from(table).update(item).eq("id", id);
    if (error) { toast.error("Erro ao atualizar"); console.error(error); return false; }
    toast.success("Atualizado com sucesso!");
    await fetch();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); console.error(error); return false; }
    toast.success("Excluído com sucesso!");
    await fetch();
    return true;
  };

  return { data, loading, fetch, create, update, remove };
}

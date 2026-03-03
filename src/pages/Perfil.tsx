import { useState } from "react";
import { motion } from "framer-motion";
import { User, Camera, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Perfil() {
  const { profile, userRole } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [clinicName, setClinicName] = useState(profile?.clinic_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, clinic_name: clinicName, phone })
      .eq("id", profile.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil atualizado!");
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
          {userRole && (
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-pastel-lavender text-primary text-xs font-semibold capitalize">
              {userRole}
            </span>
          )}
        </div>

        <div className="stat-card !p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-pastel-lavender flex items-center justify-center text-2xl font-bold text-primary">
              {displayName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/40 text-sm text-muted-foreground hover:bg-muted/40 transition-colors">
              <Camera className="w-4 h-4" /> Alterar foto
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome da Clínica</label>
            <input value={clinicName} onChange={e => setClinicName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Telefone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground" />
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

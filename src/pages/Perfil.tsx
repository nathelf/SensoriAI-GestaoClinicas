import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, Save, Building, Phone, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Perfil() {
  const { profile, userRole } = useAuth();

  // Dados Pessoais
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");

  // Dados da Clínica
  const [clinicName, setClinicName] = useState(profile?.clinic_name || "");

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        clinic_name: clinicName,
        phone,
        avatar_url: avatarUrl
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      toast.error(`Erro ao salvar perfil: ${error.message}`);
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile?.id}-${Math.random()}.${fileExt}`;

      setUploadingAvatar(true);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // Se o bucket não existir ou der erro de RLS, avisar de forma amigável
        if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("row-level security")) {
          toast.error("O recurso de upload de imagem ainda não foi configurado no servidor (Bucket 'avatars' ausente ou sem permissão).");
          return;
        }
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);

      // Auto-salvar no DB para não perder o upload se o usuário sair sem clicar em salvar
      await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profile?.id);

      toast.success("Foto de perfil atualizada!");

    } catch (error: any) {
      toast.error(`Erro no upload: ${error.message}`);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Gerenciar Perfil</h1>
              <p className="text-sm text-muted-foreground">Personalize suas informações e os dados da sua clínica.</p>
            </div>
          </div>
          {userRole && (
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              Conta: {userRole}
            </span>
          )}
        </div>

        <Tabs defaultValue="pessoal" className="w-full">
          <TabsList className="grid w-full lg:w-[400px] grid-cols-2 mb-6">
            <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="clinica">Informações da Clínica</TabsTrigger>
          </TabsList>

          <TabsContent value="pessoal" className="space-y-6 outline-none">
            <div className="stat-card !p-6 md:!p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6">Informações Básicas</h3>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-muted/50 border-2 border-border/50 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50">
                      {uploadingAvatar ? (
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      ) : avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-bold text-muted-foreground/50 uppercase">
                          {displayName?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-3 -right-3 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                      title="Alterar foto"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Formatos suportados: JPG, PNG.<br />Tamanho ideal: 256x256px.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" /> Nome de Exibição
                    </label>
                    <input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Como você quer ser chamado?"
                      className="w-full px-4 text-sm h-11 rounded-xl border border-border/50 bg-background focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" /> Telefone / WhatsApp
                    </label>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="(11) 90000-0000"
                      className="w-full px-4 text-sm h-11 rounded-xl border border-border/50 bg-background focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clinica" className="space-y-6 outline-none">
            <div className="stat-card !p-6 md:!p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6">Identidade Visual da Clínica</h3>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" /> Nome da Clínica
                  </label>
                  <input
                    value={clinicName}
                    onChange={e => setClinicName(e.target.value)}
                    placeholder="Ex: Clínica Sorriso Perfeito"
                    className="w-full px-4 text-sm h-11 rounded-xl border border-border/50 bg-background focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Este nome será usado na maioria dos documentos gerados, lembretes de WhatsApp e cobranças automáticas.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Global Save Action */}
        <div className="flex justify-end pt-4 border-t border-border/40">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Salvando alterações..." : "Salvar Alterações Globais"}
          </button>
        </div>

      </motion.div>
    </div>
  );
}

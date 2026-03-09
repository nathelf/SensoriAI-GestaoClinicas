import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function DadosClinica() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinicaId, setClinicaId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    endereco: "",
    email: ""
  });

  useEffect(() => {
    const fetchDados = async () => {
      if (!user) return;
      try {
        const { data: vinculo } = await supabase.from("usuario_clinica").select("clinica_id").eq("user_id", user.id).maybeSingle();
        if (!vinculo) { setLoading(false); return; }

        setClinicaId(vinculo.clinica_id);
        const { data: clinica } = await supabase.from("clinica_config").select("*").eq("id", vinculo.clinica_id).single();

        if (clinica) {
          setFormData({
            nome: clinica.nome_clinica || "",
            cnpj: clinica.cnpj || "",
            telefone: clinica.telefone || "",
            endereco: clinica.endereco || "",
            email: clinica.email || ""
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, [user]);

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 14) value = value.slice(0, 14);

    if (value.length > 12) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5");
    } else if (value.length > 8) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, "$1.$2.$3/$4");
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, "$1.$2.$3");
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,3}).*/, "$1.$2");
    }

    setFormData(prev => ({ ...prev, cnpj: value }));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2}).*/, "($1");
    }

    setFormData(prev => ({ ...prev, telefone: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!clinicaId) return toast.error("Nenhuma clínica vinculada para salvar.");
    if (!formData.nome.trim()) return toast.error("O campo 'Nome da Clínica' é obrigatório.");

    setSaving(true);
    const { error } = await supabase.from("clinica_config").update({
      nome_clinica: formData.nome,
      cnpj: formData.cnpj,
      telefone: formData.telefone,
      endereco: formData.endereco,
      email: formData.email
    }).eq("id", clinicaId);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Dados da clínica atualizados com sucesso!");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Dados da Clínica</h1>
        </div>

        <div className="stat-card !p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Nome da Clínica</label>
            <input
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              type="text"
              placeholder="Nome da Unidade"
              className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">CNPJ</label>
            <input
              name="cnpj"
              value={formData.cnpj}
              onChange={handleCnpjChange}
              type="text"
              placeholder="00.000.000/0001-00"
              className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Telefone</label>
            <input
              name="telefone"
              value={formData.telefone}
              onChange={handleTelefoneChange}
              type="tel"
              placeholder="(11) 99999-0000"
              className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Endereço</label>
            <input
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              type="text"
              placeholder="Rua Exemplo, 123 - São Paulo/SP"
              className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">E-mail Corporativo</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="contato@clinica.com"
              className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="pt-2">
            <button onClick={handleSave} className="flex items-center gap-2 px-6 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Save className="w-4 h-4" />
              Salvar Configurações
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

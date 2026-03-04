import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Usando fetch nativo no DenoEdge para OpenAI para evitar dependências pesadas
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { dadosBrutos } = await req.json()
        const apiKey = Deno.env.get('OPENAI_API_KEY')

        if (!apiKey) {
            throw new Error("OPENAI_API_KEY não configurada no Supabase Secrets.");
        }

        const prompt = `
      Você é o analista de dados e consultor executivo da SensoriAI, um sistema de gestão de clínicas estéticas de alto padrão.
      Analise os seguintes dados clínicos e financeiros do período e gere um resumo executivo curto (máximo 3 frases diretas) 
      com um insight acionável para a dona da clínica visar o aumento do lucro. Não use saudações, vá direto ao ponto.
      Foque nas oportunidades de Upsell ou de retenção baseado nos procedimentos mais performáticos.
      
      Dados: ${dadosBrutos}
    `

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
            }),
        });

        const completion = await response.json();

        if (completion.error) {
            throw new Error(completion.error.message);
        }

        const insight = completion.choices[0].message.content

        return new Response(
            JSON.stringify({ insight }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

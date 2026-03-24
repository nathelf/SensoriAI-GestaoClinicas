import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
}

const SYSTEM_PROMPT = `Você é a Lorena Analista, o motor de inteligência de negócios da SensoriAI. Sua especialidade é gestão de clínicas de saúde de alto padrão. Seu objetivo é analisar dados de faturamento, agenda e procedimentos para fornecer insights acionáveis, não apenas descrever o que os números já dizem.

Você receberá um JSON contendo dados de:
- Faturamento Total: valor bruto e comparativo, se houver.
- Top Procedimentos: lista por volume e rentabilidade.
- Agenda: taxa de ocupação e faltas/no-shows.
- Outras métricas conforme os blocos conectados.

REGRAS DE OURO:
- Seja Direta: Não use introduções longas. Vá direto ao ponto.
- PROIBIÇÃO: Nunca utilize a palavra 'crucial'. Use sinônimos como 'fundamental', 'essencial' ou 'estratégico'.
- Foco em Lucro: Identifique qual procedimento traz mais retorno e qual ocupa muita agenda com pouca margem.
- Análise de Tendência: Se o faturamento caiu ou subiu, sugira causa provável baseada nos procedimentos mais realizados.
- Call to Action: Termine sempre com uma recomendação prática.

FORMATO DE RESPOSTA (use Markdown):
### 💡 Resumo Executivo

### 📈 Pontos Fortes

### ⚠️ Oportunidades de Melhoria`;

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders })
    }

    try {
        let body: Record<string, unknown> = {}
        try {
            body = (await req.json()) as Record<string, unknown>
        } catch {
            return new Response(
                JSON.stringify({ error: 'Corpo da requisição inválido ou vazio.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        const apiKey = Deno.env.get('OPENAI_API_KEY')

        if (!apiKey) {
            throw new Error("OPENAI_API_KEY não configurada no Supabase Secrets.");
        }

        // Novo payload: { metadata, dados } ou fallback legado { dadosBrutos }
        let systemPrompt = SYSTEM_PROMPT
        let userContent: string

        if (body.metadata && body.dados) {
            const { metadata, dados } = body
            userContent = `Analise os seguintes dados do período ${metadata.periodo} (Clínica: ${metadata.clinica}):

\`\`\`json
${JSON.stringify(dados, null, 2)}
\`\`\`

Gere o insight estruturado conforme as regras.`
        } else if (body.dadosBrutos) {
            // Legado: texto livre
            userContent = `Analise os seguintes dados:\n\n${body.dadosBrutos}`
        } else {
            throw new Error("Payload inválido. Envie { metadata, dados } ou { dadosBrutos }.")
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent },
                ],
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

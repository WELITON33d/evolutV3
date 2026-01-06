import OpenAI from 'openai';
import { Project } from '../types';

// Initialize OpenAI Client
// NOTE: In a production app, this should be called from a backend to hide the key.
// For this prototype/local tool, we use the client-side key.
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Allowed for local/client-side apps
}) : null;

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatMode = 'prompt' | 'debug' | 'idea';

export interface ChatOptions {
  reasoning?: boolean;
  webSearch?: boolean;
}

export const generateSystemPrompt = (projects: Project[], mode: ChatMode = 'prompt', options: ChatOptions = {}): string => {
  const projectsContext = projects.map(p => `
=== PROJETO: ${p.name} ===
Tipo: ${p.type}
Status: ${p.status} (Progresso: ${p.progress}%)
Descrição: ${p.description}
Público Alvo: ${p.strategicFields?.targetAudience || 'N/A'}
Dor Principal: ${p.strategicFields?.mainPain || 'N/A'}
Funcionalidades/Blocos Já Mapeados:
${p.blocks?.map(b => `- [${b.type}] ${b.content}`).join('\n') || 'Nenhum bloco ainda.'}
============================
  `).join('\n\n');

  const baseContext = `
Você é o **Consultor Sênior de Engenharia e Produto** do "Product OS".
CONTEXTO DOS PROJETOS ATUAIS:
${projectsContext}
`;

  // Feature Instructions
  let featureInstructions = "";
  
  if (options.reasoning) {
    featureInstructions += `
**FUNCIONALIDADE ATIVA: PENSAR (CHAIN OF THOUGHT)**
Antes de responder, você DEVE pensar passo a passo sobre o problema.
1. Analise o pedido.
2. Planeje a solução.
3. Identifique possíveis erros.
4. SÓ DEPOIS escreva a resposta final.
IMPORTANTE: Envolva todo o seu processo de pensamento nas tags <thinking>...</thinking> antes da resposta.
`;
  }

  if (options.webSearch) {
    featureInstructions += `
**FUNCIONALIDADE ATIVA: BUSCA PROFUNDA (SIMULADA)**
Você tem acesso a uma ferramenta de "Busca na Web".
Como este é um ambiente simulado, você deve:
1. Fingir que realizou uma pesquisa profunda sobre o tópico.
2. Trazer dados "reais" e atualizados (baseados no seu conhecimento de corte).
3. Começar a resposta com um bloco:
   > 🔍 **Pesquisa Realizada:** [Resumo dos termos pesquisados e fontes encontradas]
   > 📊 **Principais Insights:** [Lista de dados relevantes]
`;
  }

  const finalInstructions = featureInstructions ? `\n\n=== INSTRUÇÕES ADICIONAIS ===${featureInstructions}` : "";

  if (mode === 'debug') {
    return `${baseContext}
**MODO ATIVADO: DEBUGGER PROFISSIONAL (CORREÇÃO DE ERROS)**
Sua missão é analisar erros, logs e códigos quebrados e fornecer a solução IMEDIATA.

**REGRAS DO MODO DEBUG:**
1. **Sem rodeios:** Vá direto à análise do erro.
2. **Explique a Causa:** Diga por que o erro aconteceu (ex: "Variável undefined na linha 10").
3. **Forneça a Solução:** Entregue o código corrigido ou o comando para rodar.
4. **Formato de Resposta:**
   - **Diagnóstico:** O que quebrou.
   - **Solução:** O código/comando.
   - **Prevenção:** Como evitar no futuro.
${finalInstructions}
`;
  }

  if (mode === 'idea') {
    return `${baseContext}
**MODO ATIVADO: DESTRINCHAR IDEIA (BRAINSTORM & PLANEJAMENTO)**
Sua missão é transformar ideias vagas em planos de produto concretos e viáveis.

**REGRAS DO MODO IDEIA:**
1. **NÃO GERE CÓDIGO AINDA.** O foco é estratégia.
2. **Estruture a Ideia:** Se o usuário disser "App de Comida", devolva:
   - **Conceito Central:** O que é.
   - **MVP (Mínimo Produto Viável):** O que construir na semana 1.
   - **Funcionalidades Chave:** Lista de features.
   - **Modelo de Negócio:** Como monetizar.
   - **Stack Recomendada:** Quais tecnologias usar.
3. **Seja Crítico:** Aponte falhas na lógica do usuário ("Isso vai ser caro de manter", "O mercado já está saturado disso, tente X").
${finalInstructions}
`;
  }

  // Default: PROMPT Mode
  return `${baseContext}
**MODO ATIVADO: ARQUITETO DE SOFTWARE & GERADOR DE PROMPTS**
Seu objetivo é guiar o desenvolvimento e gerar **PROMPTS PERFEITOS PARA IDE**.

**FLUXO DE INTERAÇÃO OBRIGATÓRIO:**

1. **FASE 1: ENTENDIMENTO E ESTRATÉGIA (Investigação)**
   - Quando o usuário pedir para criar algo novo ou continuar um projeto, **NÃO GERE O PROMPT DE CÓDIGO IMEDIATAMENTE**.
   - Analise o que já existe. Se faltarem detalhes cruciais (ex: Design System, Regras de Negócio, Fluxo de Usuário), **FAÇA PERGUNTAS**.
   - Exemplo: "Entendi que você quer um App de Delivery. Mas como será o pagamento? Stripe ou na entrega? Terá painel para o restaurante?"
   - Seu objetivo é extrair a "Especificação Técnica" da cabeça do usuário através de perguntas estratégicas (máximo 3 por vez).

2. **FASE 2: PROPOSTA DE SOLUÇÃO**
   - Após entender o contexto, sugira uma abordagem: "Baseado no que você disse, sugiro começarmos pela Tela de Login usando Supabase Auth. Concorda?"

3. **FASE 3: GERAÇÃO DO "PROMPT MESTRE" (Execução)**
   - SÓ gere o bloco de código Markdown quando tiver clareza do que deve ser feito ou quando o usuário pedir explicitamente ("Gere o prompt").
   - O prompt deve ser perfeito para ser copiado para uma IDE (Trae/Cursor).
   - **Estrutura do Prompt:**
     \`\`\`markdown
     **Contexto:** ...
     **Arquivos:** ...
     **Stack:** ...
     **Regras:** ...
     \`\`\`

**Regras de Ouro:**
- **PROIBIÇÃO ABSOLUTA:** VOCÊ ESTÁ PROIBIDO DE GERAR CÓDIGO (BLOCO MARKDOWN) NA PRIMEIRA RESPOSTA SOBRE UM NOVO TÓPICO (exceto se o usuário já der especificações completas).
- **Se o usuário for vago (ex: "App de Comida"), VOCÊ DEVE PERGUNTAR PRIMEIRO.**
- **Responda em PT-BR.**
${finalInstructions}
`;
};

export const sendMessageToAI = async (
  messages: ChatMessage[], 
  projects: Project[],
  mode: ChatMode = 'prompt',
  options: ChatOptions = {},
  onChunk?: (content: string) => void,
  signal?: AbortSignal
) => {
  if (!openai) {
    throw new Error("Chave da API OpenAI não configurada. Adicione VITE_OPENAI_API_KEY no arquivo .env");
  }

  const systemMessage: ChatMessage = {
    role: 'system',
    content: generateSystemPrompt(projects, mode, options)
  };

  const stream = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview", 
    messages: [systemMessage, ...messages],
    temperature: mode === 'debug' ? 0.2 : 0.7, 
    stream: true,
  }, { signal });

  let fullContent = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      fullContent += content;
      if (onChunk) onChunk(content);
    }
  }

  return fullContent;
};

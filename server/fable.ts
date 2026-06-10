import Anthropic from "@anthropic-ai/sdk";
import { ENV } from "./_core/env";
import { invokeLLM, type Message as ForgeMessage } from "./_core/llm";
import { getMarketContextText } from "./marketData";

/**
 * Assistente "Fable 5" do Terminal — analista de mercado conversacional.
 *
 * Usa o modelo Claude Fable 5 via SDK oficial da Anthropic quando
 * ANTHROPIC_API_KEY está configurada; caso contrário, degrada para o
 * LLM embutido da plataforma (forge) para que o terminal continue
 * funcional em qualquer ambiente.
 */

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type FableReply = {
  reply: string;
  model: string;
};

const FABLE_MODEL = "claude-fable-5";

const SYSTEM_PROMPT = `Você é FABLE 5, o analista de mercado residente do terminal financeiro do TilapiaTrack Pro — um sistema de gestão de piscicultura (criação de tilápia).

Sua função:
- Comentar cotações, tendências e manchetes do painel de mercado (ações de aquicultura e proteína, commodities de ração como milho/soja/farelo, preço da tilápia, câmbio e índices).
- Relacionar o mercado com a operação da fazenda do usuário (custo de ração, preço de venda da tilápia, câmbio para insumos importados).
- Responder dúvidas gerais de finanças e do agronegócio.

Estilo:
- Responda SEMPRE em português do Brasil.
- Seja direto e conciso, como um analista em um terminal: 1 a 4 frases para perguntas simples; use listas curtas apenas quando agregar.
- Suas respostas podem ser lidas em voz alta (text-to-speech): evite tabelas, código, markdown pesado e símbolos; escreva números de forma natural.
- Cite os dados do painel quando relevante, mas deixe claro que os valores do terminal são indicativos e não constituem recomendação de investimento.

Os dados ao vivo do painel e o resumo da fazenda chegam dentro da última mensagem do usuário, entre as tags <dados_do_terminal>. Use-os como fonte primária.`;

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: ENV.anthropicApiKey });
  }
  return anthropicClient;
}

function buildContextBlock(farmContext?: string): string {
  const market = getMarketContextText();
  const farm = farmContext ? `\n\nResumo da fazenda do usuário:\n${farmContext}` : "";
  return `<dados_do_terminal>\n${market}${farm}\n</dados_do_terminal>`;
}

async function askViaAnthropic(turns: ChatTurn[], contextBlock: string): Promise<FableReply> {
  const client = getAnthropicClient();

  // O contexto volátil (cotações) vai apenas no último turno do usuário,
  // mantendo o prefixo (system + histórico) estável para cache.
  const messages: Anthropic.MessageParam[] = turns.map((turn, index) => ({
    role: turn.role,
    content:
      index === turns.length - 1 && turn.role === "user"
        ? `${contextBlock}\n\n${turn.content}`
        : turn.content,
  }));

  const response = await client.messages.create({
    model: FABLE_MODEL,
    max_tokens: 2048, // respostas curtas, adequadas para leitura em voz alta
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  const reply = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map(block => block.text)
    .join("\n")
    .trim();

  return { reply, model: response.model };
}

async function askViaForge(turns: ChatTurn[], contextBlock: string): Promise<FableReply> {
  const messages: ForgeMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...turns.map((turn, index) => ({
      role: turn.role,
      content:
        index === turns.length - 1 && turn.role === "user"
          ? `${contextBlock}\n\n${turn.content}`
          : turn.content,
    })),
  ];

  const result = await invokeLLM({ messages });
  const content = result.choices[0]?.message?.content;
  const reply =
    typeof content === "string"
      ? content
      : (content ?? [])
          .map(part => (part.type === "text" ? part.text : ""))
          .join("\n");

  return { reply: reply.trim(), model: result.model };
}

export async function askFable(turns: ChatTurn[], farmContext?: string): Promise<FableReply> {
  if (turns.length === 0 || turns[turns.length - 1].role !== "user") {
    throw new Error("A última mensagem deve ser do usuário");
  }

  const contextBlock = buildContextBlock(farmContext);

  if (ENV.anthropicApiKey) {
    try {
      return await askViaAnthropic(turns, contextBlock);
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        console.error(`[Fable] Anthropic API error ${error.status}: ${error.message}`);
      } else {
        console.error("[Fable] Anthropic request failed:", error);
      }
      // Degrada para o LLM da plataforma em vez de derrubar o chat
      return askViaForge(turns, contextBlock);
    }
  }

  return askViaForge(turns, contextBlock);
}

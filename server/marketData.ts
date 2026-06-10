import { getWebSocketServer } from "./websocket";

/**
 * Serviço de dados de mercado do Terminal (estilo Bloomberg).
 *
 * Mantém um universo de ativos relevantes para o agronegócio/aquicultura
 * (ações de salmão/proteína, commodities de ração, câmbio e índices),
 * gera um feed ao vivo via random-walk ancorado em preços realistas e
 * transmite os ticks para os clientes conectados via Socket.IO.
 */

export type Quote = {
  symbol: string;
  name: string;
  market: string;
  currency: string;
  price: number;
  open: number;
  prevClose: number;
  high: number;
  low: number;
  change: number;
  changePct: number;
  volume: number;
  bid: number;
  ask: number;
  updatedAt: number;
};

export type PricePoint = { t: number; p: number };

export type Headline = {
  id: number;
  time: number;
  source: string;
  text: string;
  symbol?: string;
};

export type MarketSnapshot = {
  quotes: Quote[];
  history: Record<string, PricePoint[]>;
  headlines: Headline[];
};

type SymbolDef = {
  symbol: string;
  name: string;
  market: string;
  currency: string;
  base: number;
  // Volatilidade por tick (desvio relativo)
  vol: number;
  volumeBase: number;
  decimals: number;
};

const SYMBOL_DEFS: SymbolDef[] = [
  // Aquicultura global
  { symbol: "MOWI", name: "Mowi ASA", market: "OSLO", currency: "NOK", base: 192.4, vol: 0.0012, volumeBase: 850_000, decimals: 2 },
  { symbol: "SALM", name: "SalMar ASA", market: "OSLO", currency: "NOK", base: 512.0, vol: 0.0012, volumeBase: 320_000, decimals: 2 },
  { symbol: "LSG", name: "Lerøy Seafood", market: "OSLO", currency: "NOK", base: 47.3, vol: 0.0014, volumeBase: 1_200_000, decimals: 2 },
  { symbol: "BAKKA", name: "Bakkafrost", market: "OSLO", currency: "NOK", base: 534.5, vol: 0.0013, volumeBase: 110_000, decimals: 2 },
  { symbol: "GSF", name: "Grieg Seafood", market: "OSLO", currency: "NOK", base: 61.2, vol: 0.0018, volumeBase: 700_000, decimals: 2 },
  // Proteína / agro Brasil
  { symbol: "JBSS3", name: "JBS S.A.", market: "B3", currency: "BRL", base: 36.8, vol: 0.0012, volumeBase: 9_000_000, decimals: 2 },
  { symbol: "BRFS3", name: "BRF S.A.", market: "B3", currency: "BRL", base: 19.4, vol: 0.0016, volumeBase: 12_000_000, decimals: 2 },
  { symbol: "MRFG3", name: "Marfrig", market: "B3", currency: "BRL", base: 17.1, vol: 0.0018, volumeBase: 5_500_000, decimals: 2 },
  { symbol: "BEEF3", name: "Minerva Foods", market: "B3", currency: "BRL", base: 6.42, vol: 0.0018, volumeBase: 7_800_000, decimals: 2 },
  { symbol: "SLCE3", name: "SLC Agrícola", market: "B3", currency: "BRL", base: 18.6, vol: 0.0014, volumeBase: 2_400_000, decimals: 2 },
  { symbol: "AGRO3", name: "BrasilAgro", market: "B3", currency: "BRL", base: 23.9, vol: 0.0013, volumeBase: 900_000, decimals: 2 },
  // Commodities de ração e pescado
  { symbol: "MILHO", name: "Milho (saca 60kg)", market: "CEPEA", currency: "BRL", base: 58.9, vol: 0.0008, volumeBase: 0, decimals: 2 },
  { symbol: "SOJA", name: "Soja (saca 60kg)", market: "CEPEA", currency: "BRL", base: 128.7, vol: 0.0008, volumeBase: 0, decimals: 2 },
  { symbol: "FARELO", name: "Farelo de Soja (t)", market: "CBOT", currency: "USD", base: 312.5, vol: 0.001, volumeBase: 0, decimals: 2 },
  { symbol: "FISHML", name: "Farinha de Peixe (t)", market: "PERU", currency: "USD", base: 1648.0, vol: 0.0009, volumeBase: 0, decimals: 0 },
  { symbol: "TILAPIA", name: "Tilápia viva (kg)", market: "CEPEA", currency: "BRL", base: 9.84, vol: 0.0007, volumeBase: 0, decimals: 2 },
  // Câmbio e índices
  { symbol: "USDBRL", name: "Dólar / Real", market: "FX", currency: "BRL", base: 5.452, vol: 0.0005, volumeBase: 0, decimals: 4 },
  { symbol: "EURBRL", name: "Euro / Real", market: "FX", currency: "BRL", base: 5.948, vol: 0.0005, volumeBase: 0, decimals: 4 },
  { symbol: "IBOV", name: "Ibovespa", market: "B3", currency: "PTS", base: 128_450, vol: 0.0006, volumeBase: 0, decimals: 0 },
  { symbol: "OSEBX", name: "Oslo Børs Index", market: "OSLO", currency: "PTS", base: 1452.3, vol: 0.0006, volumeBase: 0, decimals: 2 },
];

const HEADLINE_TEMPLATES: Array<{ source: string; text: string; symbol?: string }> = [
  { source: "CEPEA", text: "Preço da tilápia viva sobe com demanda aquecida no interior de SP", symbol: "TILAPIA" },
  { source: "CEPEA", text: "Milho recua nas praças do interior com avanço da colheita da safrinha", symbol: "MILHO" },
  { source: "CEPEA", text: "Indicador da soja oscila com câmbio e prêmios nos portos", symbol: "SOJA" },
  { source: "REUTERS", text: "Mowi reporta volumes recordes de colheita no segundo trimestre", symbol: "MOWI" },
  { source: "REUTERS", text: "SalMar amplia capacidade offshore e eleva guidance anual", symbol: "SALM" },
  { source: "BLOOMBERG", text: "Custos de ração pressionam margens da aquicultura global no semestre", symbol: "FARELO" },
  { source: "BLOOMBERG", text: "Farinha de peixe atinge novo patamar com quota reduzida de anchoveta no Peru", symbol: "FISHML" },
  { source: "VALOR", text: "JBS avalia expansão em pescados e mira aquisições na América Latina", symbol: "JBSS3" },
  { source: "VALOR", text: "BRF acelera exportações de frango e melhora mix de produtos", symbol: "BRFS3" },
  { source: "AGÊNCIA BRASIL", text: "Exportações brasileiras de tilápia crescem em ritmo de dois dígitos no ano", symbol: "TILAPIA" },
  { source: "FX DESK", text: "Dólar opera em alta ante o real com cautela fiscal doméstica", symbol: "USDBRL" },
  { source: "B3", text: "Ibovespa alterna sinais com vencimento de opções e fluxo estrangeiro", symbol: "IBOV" },
  { source: "INTRAFISH", text: "Demanda chinesa por filé de tilápia congelado segue firme no trimestre", symbol: "TILAPIA" },
  { source: "INTRAFISH", text: "Lerøy investe em RAS para ampliar produção de smolt na Noruega", symbol: "LSG" },
  { source: "PEIXE BR", text: "Produção brasileira de tilápia deve bater novo recorde este ano", symbol: "TILAPIA" },
  { source: "NASDAQ SALMON", text: "Índice do salmão fresco avança na semana com oferta restrita", symbol: "MOWI" },
];

const TICK_INTERVAL_MS = 2_500;
const HEADLINE_INTERVAL_MS = 40_000;
const HISTORY_LIMIT = 240;
const HEADLINES_LIMIT = 40;

const quotes = new Map<string, Quote>();
const history = new Map<string, PricePoint[]>();
const headlines: Headline[] = [];

let nextHeadlineId = 1;
let tickTimer: NodeJS.Timeout | null = null;
let headlineTimer: NodeJS.Timeout | null = null;

function gaussian(): number {
  // Box-Muller
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

function defFor(symbol: string): SymbolDef {
  const def = SYMBOL_DEFS.find(d => d.symbol === symbol);
  if (!def) throw new Error(`Unknown symbol: ${symbol}`);
  return def;
}

function initializeQuotes(): void {
  const now = Date.now();
  for (const def of SYMBOL_DEFS) {
    // Abertura ligeiramente deslocada do fechamento anterior
    const prevClose = def.base;
    const open = round(prevClose * (1 + gaussian() * def.vol * 2), def.decimals);
    const quote: Quote = {
      symbol: def.symbol,
      name: def.name,
      market: def.market,
      currency: def.currency,
      price: open,
      open,
      prevClose,
      high: open,
      low: open,
      change: round(open - prevClose, def.decimals),
      changePct: round(((open - prevClose) / prevClose) * 100, 2),
      volume: Math.round(def.volumeBase * (0.4 + Math.random() * 0.3)),
      bid: round(open * 0.9995, def.decimals),
      ask: round(open * 1.0005, def.decimals),
      updatedAt: now,
    };
    quotes.set(def.symbol, quote);

    // Pré-popular o histórico intradiário para os gráficos abrirem preenchidos
    const points: PricePoint[] = [];
    let p = open;
    const start = now - HISTORY_LIMIT * TICK_INTERVAL_MS;
    for (let i = 0; i < HISTORY_LIMIT; i++) {
      p = p * (1 + gaussian() * def.vol);
      points.push({ t: start + i * TICK_INTERVAL_MS, p: round(p, def.decimals) });
    }
    quote.price = points[points.length - 1].p;
    quote.high = round(Math.max(...points.map(pt => pt.p), quote.high), def.decimals);
    quote.low = round(Math.min(...points.map(pt => pt.p), quote.low), def.decimals);
    quote.change = round(quote.price - prevClose, def.decimals);
    quote.changePct = round((quote.change / prevClose) * 100, 2);
    history.set(def.symbol, points);
  }

  // Algumas manchetes iniciais
  for (let i = 0; i < 6; i++) {
    pushHeadline(now - (6 - i) * HEADLINE_INTERVAL_MS);
  }
}

function pushHeadline(time = Date.now()): Headline {
  const template = HEADLINE_TEMPLATES[Math.floor(Math.random() * HEADLINE_TEMPLATES.length)];
  const headline: Headline = { id: nextHeadlineId++, time, ...template };
  headlines.push(headline);
  if (headlines.length > HEADLINES_LIMIT) headlines.shift();
  return headline;
}

export function tickMarket(): Quote[] {
  const now = Date.now();
  for (const def of SYMBOL_DEFS) {
    const quote = quotes.get(def.symbol)!;
    // Random-walk com leve reversão à média para não derivar do preço-âncora
    const meanReversion = (def.base - quote.price) / def.base * 0.002;
    const next = quote.price * (1 + gaussian() * def.vol + meanReversion);
    quote.price = round(next, def.decimals);
    quote.high = Math.max(quote.high, quote.price);
    quote.low = Math.min(quote.low, quote.price);
    quote.change = round(quote.price - quote.prevClose, def.decimals);
    quote.changePct = round((quote.change / quote.prevClose) * 100, 2);
    quote.bid = round(quote.price * 0.9995, def.decimals);
    quote.ask = round(quote.price * 1.0005, def.decimals);
    if (def.volumeBase > 0) {
      quote.volume += Math.round(def.volumeBase * Math.random() * 0.005);
    }
    quote.updatedAt = now;

    const points = history.get(def.symbol)!;
    points.push({ t: now, p: quote.price });
    if (points.length > HISTORY_LIMIT) points.shift();
  }
  return Array.from(quotes.values());
}

export function getMarketSnapshot(): MarketSnapshot {
  if (quotes.size === 0) initializeQuotes();
  return {
    quotes: Array.from(quotes.values()),
    history: Object.fromEntries(history),
    headlines: [...headlines].reverse(),
  };
}

/**
 * Resumo compacto em texto para servir de contexto ao assistente Fable 5.
 */
export function getMarketContextText(): string {
  if (quotes.size === 0) initializeQuotes();
  const lines = Array.from(quotes.values()).map(
    q =>
      `${q.symbol} (${q.name}, ${q.market}): ${q.price.toLocaleString("pt-BR")} ${q.currency} ` +
      `(${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}% no dia, máx ${q.high}, mín ${q.low})`
  );
  const news = headlines
    .slice(-8)
    .reverse()
    .map(h => `- [${h.source}] ${h.text}`);
  return `Cotações ao vivo:\n${lines.join("\n")}\n\nÚltimas manchetes:\n${news.join("\n")}`;
}

export function startMarketFeed(): void {
  if (tickTimer) return; // idempotente
  if (quotes.size === 0) initializeQuotes();

  tickTimer = setInterval(() => {
    const updated = tickMarket();
    const io = getWebSocketServer();
    io?.emit("market:tick", { quotes: updated, at: Date.now() });
  }, TICK_INTERVAL_MS);

  headlineTimer = setInterval(() => {
    const headline = pushHeadline();
    const io = getWebSocketServer();
    io?.emit("market:headline", headline);
  }, HEADLINE_INTERVAL_MS);

  console.log(`[MarketFeed] Live feed started (${SYMBOL_DEFS.length} symbols, tick ${TICK_INTERVAL_MS}ms)`);
}

export function stopMarketFeed(): void {
  if (tickTimer) clearInterval(tickTimer);
  if (headlineTimer) clearInterval(headlineTimer);
  tickTimer = null;
  headlineTimer = null;
}

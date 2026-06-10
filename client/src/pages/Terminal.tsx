import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Quote, Headline, PricePoint } from "../../../server/marketData";

const HISTORY_LIMIT = 240;

type ChatMessage = { role: "user" | "assistant"; content: string };

function formatPrice(quote: Quote): string {
  const decimals = quote.price >= 1000 ? 0 : quote.price >= 100 ? 2 : quote.price < 10 ? quote.symbol.includes("BRL") ? 4 : 2 : 2;
  return quote.price.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function changeColor(value: number): string {
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-red-400";
  return "text-neutral-400";
}

export default function Terminal() {
  const { isAuthenticated, loginUrl } = useAuth();

  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [history, setHistory] = useState<Record<string, PricePoint[]>>({});
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("TILAPIA");
  const [isLive, setIsLive] = useState(false);
  const [clock, setClock] = useState(() => formatTime(Date.now()));

  // Chat Fable 5
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "FABLE 5 online. Sou o analista de mercado do seu terminal — pergunte sobre cotações, ração, câmbio ou o preço da tilápia. Você também pode falar comigo pelo microfone.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const prevPricesRef = useRef<Record<string, number>>({});
  const flashRef = useRef<Record<string, "up" | "down">>({});

  const snapshotQuery = trpc.terminal.snapshot.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const askMutation = trpc.terminal.ask.useMutation();
  const transcribeMutation = trpc.terminal.transcribe.useMutation();

  // Snapshot inicial
  useEffect(() => {
    const data = snapshotQuery.data;
    if (!data) return;
    setQuotes(Object.fromEntries(data.quotes.map(q => [q.symbol, q])));
    setHistory(data.history);
    setHeadlines(data.headlines);
  }, [snapshotQuery.data]);

  // Feed ao vivo via Socket.IO
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket: Socket = io(window.location.origin, {
      reconnection: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setIsLive(true));
    socket.on("disconnect", () => setIsLive(false));

    socket.on("market:tick", (data: { quotes: Quote[]; at: number }) => {
      const flashes: Record<string, "up" | "down"> = {};
      for (const quote of data.quotes) {
        const prev = prevPricesRef.current[quote.symbol];
        if (prev !== undefined && prev !== quote.price) {
          flashes[quote.symbol] = quote.price > prev ? "up" : "down";
        }
        prevPricesRef.current[quote.symbol] = quote.price;
      }
      flashRef.current = flashes;

      setQuotes(Object.fromEntries(data.quotes.map(q => [q.symbol, q])));
      setHistory(prev => {
        const next = { ...prev };
        for (const quote of data.quotes) {
          const points = [...(next[quote.symbol] ?? []), { t: quote.updatedAt, p: quote.price }];
          if (points.length > HISTORY_LIMIT) points.shift();
          next[quote.symbol] = points;
        }
        return next;
      });
    });

    socket.on("market:headline", (headline: Headline) => {
      setHeadlines(prev => [headline, ...prev].slice(0, 40));
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  // Relógio do header
  useEffect(() => {
    const timer = setInterval(() => setClock(formatTime(Date.now())), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, askMutation.isPending]);

  const speak = useCallback(
    (text: string) => {
      if (!voiceOutput || typeof window.speechSynthesis === "undefined") return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    },
    [voiceOutput]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || askMutation.isPending) return;

      const nextMessages: ChatMessage[] = [...chatMessages, { role: "user", content }];
      setChatMessages(nextMessages);
      setChatInput("");

      try {
        const result = await askMutation.mutateAsync({
          // Mantém apenas os últimos turnos para limitar o payload
          messages: nextMessages.slice(-20),
        });
        setChatMessages(prev => [...prev, { role: "assistant", content: result.reply }]);
        speak(result.reply);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha ao consultar o Fable 5";
        toast.error(message);
        setChatMessages(prev => [
          ...prev,
          { role: "assistant", content: "Não consegui processar agora. Tente novamente em instantes." },
        ]);
      }
    },
    [askMutation, chatMessages, speak]
  );

  // ===== Entrada por voz =====
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.();
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognitionImpl =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionImpl) {
      // Reconhecimento nativo do navegador (Chrome/Edge)
      const recognition = new SpeechRecognitionImpl();
      recognition.lang = "pt-BR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript as string | undefined;
        if (transcript) {
          void sendMessage(transcript);
        }
      };
      recognition.onerror = (event: any) => {
        if (event.error !== "aborted") {
          toast.error("Não consegui captar o áudio. Tente novamente.");
        }
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      return;
    }

    // Fallback: gravar com MediaRecorder e transcrever no servidor (Whisper)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = event => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(",")[1];
          try {
            const result = await transcribeMutation.mutateAsync({
              audioBase64: base64,
              mimeType: blob.type,
              language: "pt",
            });
            if (result.text.trim()) {
              void sendMessage(result.text);
            } else {
              toast.error("Nenhuma fala detectada.");
            }
          } catch {
            toast.error("Falha na transcrição do áudio.");
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsListening(true);
      toast.info("Gravando... clique no microfone novamente para enviar.");
    } catch {
      toast.error("Microfone indisponível ou permissão negada.");
    }
  }, [isListening, sendMessage, stopListening, transcribeMutation]);

  const quoteList = useMemo(
    () => Object.values(quotes).sort((a, b) => a.market.localeCompare(b.market) || a.symbol.localeCompare(b.symbol)),
    [quotes]
  );

  const selected = quotes[selectedSymbol];
  const selectedHistory = history[selectedSymbol] ?? [];
  const chartData = useMemo(
    () => selectedHistory.map(point => ({ time: formatTime(point.t), price: point.p })),
    [selectedHistory]
  );
  const chartRising = (selected?.changePct ?? 0) >= 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Faça login para acessar o Terminal de Mercado.
            </p>
            <Button asChild className="w-full">
              <a href={loginUrl}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-black text-neutral-200 font-mono text-sm">
      <style>{`
        @keyframes terminal-flash-up { 0% { background-color: rgba(16,185,129,0.45); } 100% { background-color: transparent; } }
        @keyframes terminal-flash-down { 0% { background-color: rgba(239,68,68,0.45); } 100% { background-color: transparent; } }
        .flash-up { animation: terminal-flash-up 0.9s ease-out; }
        .flash-down { animation: terminal-flash-down 0.9s ease-out; }
        @keyframes terminal-tape { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .tape-track { animation: terminal-tape 60s linear infinite; }
        .tape-track:hover { animation-play-state: paused; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-600/40 bg-neutral-950 px-4 py-2">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-amber-500" />
          <span className="font-bold tracking-widest text-amber-500">TILAPIATRACK TERMINAL</span>
          <span className="hidden md:inline text-xs text-neutral-500">AQUA &amp; AGRO MARKETS</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-amber-400">FABLE 5 &lt;GO&gt;</span>
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            {isLive ? "AO VIVO" : "OFFLINE"}
          </span>
          <span className="tabular-nums text-neutral-400">{clock}</span>
        </div>
      </div>

      {/* Ticker tape */}
      <div className="overflow-hidden border-b border-neutral-800 bg-neutral-950 py-1.5">
        <div className="tape-track flex w-max gap-8 whitespace-nowrap px-4">
          {[...quoteList, ...quoteList].map((quote, index) => (
            <button
              key={`${quote.symbol}-${index}`}
              onClick={() => setSelectedSymbol(quote.symbol)}
              className="flex items-center gap-2 text-xs hover:text-amber-400"
            >
              <span className="font-bold text-neutral-100">{quote.symbol}</span>
              <span className="tabular-nums">{formatPrice(quote)}</span>
              <span className={`tabular-nums ${changeColor(quote.changePct)}`}>
                {quote.changePct >= 0 ? "▲" : "▼"} {Math.abs(quote.changePct).toFixed(2)}%
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 p-2 xl:grid-cols-12">
        {/* Watchlist */}
        <div className="xl:col-span-5 border border-neutral-800 bg-neutral-950">
          <div className="border-b border-neutral-800 px-3 py-1.5 text-xs font-bold text-amber-500">
            MONITOR DE MERCADO ({quoteList.length} ATIVOS)
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-neutral-950 text-neutral-500">
                <tr className="border-b border-neutral-800 text-left">
                  <th className="px-3 py-1.5">ATIVO</th>
                  <th className="px-2 py-1.5 text-right">ÚLTIMO</th>
                  <th className="px-2 py-1.5 text-right">VAR%</th>
                  <th className="hidden px-2 py-1.5 text-right md:table-cell">MÁX</th>
                  <th className="hidden px-2 py-1.5 text-right md:table-cell">MÍN</th>
                  <th className="hidden px-2 py-1.5 text-right lg:table-cell">VOL</th>
                </tr>
              </thead>
              <tbody>
                {quoteList.map(quote => {
                  const flash = flashRef.current[quote.symbol];
                  return (
                    <tr
                      key={quote.symbol}
                      onClick={() => setSelectedSymbol(quote.symbol)}
                      className={`cursor-pointer border-b border-neutral-900 hover:bg-neutral-900 ${
                        quote.symbol === selectedSymbol ? "bg-amber-950/40" : ""
                      }`}
                    >
                      <td className="px-3 py-1.5">
                        <span className="font-bold text-neutral-100">{quote.symbol}</span>
                        <span className="ml-2 hidden text-neutral-500 sm:inline">{quote.market}</span>
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <span
                          key={quote.updatedAt}
                          className={`tabular-nums px-1 ${flash ? `flash-${flash}` : ""}`}
                        >
                          {formatPrice(quote)}
                        </span>
                      </td>
                      <td className={`px-2 py-1.5 text-right tabular-nums ${changeColor(quote.changePct)}`}>
                        {quote.changePct >= 0 ? "+" : ""}
                        {quote.changePct.toFixed(2)}%
                      </td>
                      <td className="hidden px-2 py-1.5 text-right tabular-nums text-neutral-400 md:table-cell">
                        {quote.high.toLocaleString("pt-BR")}
                      </td>
                      <td className="hidden px-2 py-1.5 text-right tabular-nums text-neutral-400 md:table-cell">
                        {quote.low.toLocaleString("pt-BR")}
                      </td>
                      <td className="hidden px-2 py-1.5 text-right tabular-nums text-neutral-500 lg:table-cell">
                        {quote.volume > 0 ? (quote.volume / 1_000_000).toFixed(2) + "M" : "—"}
                      </td>
                    </tr>
                  );
                })}
                {quoteList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-neutral-500">
                      Carregando cotações...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráfico do ativo selecionado */}
        <div className="xl:col-span-7 border border-neutral-800 bg-neutral-950">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 px-3 py-1.5">
            <div className="text-xs font-bold text-amber-500">
              {selected ? `${selected.symbol} — ${selected.name} (${selected.market})` : "GRÁFICO INTRADIÁRIO"}
            </div>
            {selected && (
              <div className="flex items-center gap-3 text-xs tabular-nums">
                <span className="text-lg font-bold text-neutral-100">
                  {formatPrice(selected)} <span className="text-xs text-neutral-500">{selected.currency}</span>
                </span>
                <span className={changeColor(selected.changePct)}>
                  {selected.change >= 0 ? "+" : ""}
                  {selected.change.toLocaleString("pt-BR")} ({selected.changePct >= 0 ? "+" : ""}
                  {selected.changePct.toFixed(2)}%)
                </span>
                <span className="hidden text-neutral-500 md:inline">
                  BID {selected.bid.toLocaleString("pt-BR")} / ASK {selected.ask.toLocaleString("pt-BR")}
                </span>
              </div>
            )}
          </div>
          <div className="h-[392px] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="terminalArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartRising ? "#10b981" : "#ef4444"} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={chartRising ? "#10b981" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="time" stroke="#525252" tick={{ fontSize: 10 }} minTickGap={48} />
                <YAxis
                  stroke="#525252"
                  tick={{ fontSize: 10 }}
                  domain={["auto", "auto"]}
                  width={70}
                  tickFormatter={(value: number) => value.toLocaleString("pt-BR")}
                />
                <Tooltip
                  contentStyle={{ background: "#0a0a0a", border: "1px solid #404040", fontSize: 12 }}
                  labelStyle={{ color: "#a3a3a3" }}
                  formatter={(value: number) => [value.toLocaleString("pt-BR"), "Preço"]}
                />
                {selected && (
                  <ReferenceLine
                    y={selected.prevClose}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: "FECH. ANT.", fill: "#f59e0b", fontSize: 9, position: "insideTopRight" }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartRising ? "#10b981" : "#ef4444"}
                  strokeWidth={1.5}
                  fill="url(#terminalArea)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notícias */}
        <div className="xl:col-span-5 border border-neutral-800 bg-neutral-950">
          <div className="border-b border-neutral-800 px-3 py-1.5 text-xs font-bold text-amber-500">
            NOTÍCIAS &lt;NEWS&gt;
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {headlines.map(headline => (
              <button
                key={headline.id}
                onClick={() => headline.symbol && quotes[headline.symbol] && setSelectedSymbol(headline.symbol)}
                className="block w-full border-b border-neutral-900 px-3 py-2 text-left text-xs hover:bg-neutral-900"
              >
                <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                  <span className="tabular-nums">{formatTime(headline.time)}</span>
                  <span className="text-amber-600">{headline.source}</span>
                  {headline.symbol && <span className="text-neutral-400">[{headline.symbol}]</span>}
                </div>
                <div className="mt-0.5 text-neutral-200">{headline.text}</div>
              </button>
            ))}
            {headlines.length === 0 && (
              <div className="px-3 py-6 text-center text-neutral-500">Sem manchetes no momento.</div>
            )}
          </div>
        </div>

        {/* Chat Fable 5 */}
        <div className="xl:col-span-7 flex flex-col border border-amber-600/40 bg-neutral-950">
          <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-1.5">
            <span className="text-xs font-bold text-amber-500">FABLE 5 — ANALISTA DE MERCADO &lt;GO&gt;</span>
            <button
              onClick={() => {
                if (voiceOutput) window.speechSynthesis?.cancel();
                setVoiceOutput(!voiceOutput);
              }}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-amber-400"
              title={voiceOutput ? "Desativar voz" : "Ativar voz"}
            >
              {voiceOutput ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              VOZ {voiceOutput ? "ON" : "OFF"}
            </button>
          </div>

          <div className="h-[280px] flex-1 space-y-2 overflow-y-auto p-3">
            {chatMessages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded px-3 py-2 text-xs leading-relaxed ${
                    message.role === "user"
                      ? "bg-amber-950/60 text-amber-100"
                      : "border border-neutral-800 bg-neutral-900 text-neutral-200"
                  }`}
                >
                  {message.role === "assistant" && (
                    <span className="mr-1 font-bold text-amber-500">FABLE5&gt;</span>
                  )}
                  {message.content}
                </div>
              </div>
            ))}
            {askMutation.isPending && (
              <div className="flex justify-start">
                <div className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-400">
                  <span className="font-bold text-amber-500">FABLE5&gt;</span> analisando
                  <span className="animate-pulse">▮</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            className="flex items-center gap-2 border-t border-neutral-800 p-2"
            onSubmit={event => {
              event.preventDefault();
              void sendMessage(chatInput);
            }}
          >
            <button
              type="button"
              onClick={() => void startListening()}
              disabled={transcribeMutation.isPending}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded border ${
                isListening
                  ? "border-red-500 bg-red-950 text-red-400 animate-pulse"
                  : "border-neutral-700 text-neutral-400 hover:border-amber-500 hover:text-amber-400"
              }`}
              title={isListening ? "Parar gravação" : "Falar com o Fable 5"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <input
              value={chatInput}
              onChange={event => setChatInput(event.target.value)}
              placeholder={
                isListening
                  ? "Ouvindo..."
                  : transcribeMutation.isPending
                    ? "Transcrevendo áudio..."
                    : "Pergunte sobre o mercado (ex.: como está o preço da tilápia hoje?)"
              }
              className="h-9 flex-1 rounded border border-neutral-700 bg-black px-3 text-xs text-neutral-100 placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={askMutation.isPending || !chatInput.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-amber-600 bg-amber-950/50 text-amber-400 hover:bg-amber-900/50 disabled:opacity-40"
              title="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="px-3 pb-3 text-[10px] text-neutral-600">
        Dados indicativos para acompanhamento operacional da fazenda — não constituem recomendação de investimento.
      </div>
    </div>
  );
}

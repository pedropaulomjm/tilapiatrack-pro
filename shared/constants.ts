// Limites padrão de parâmetros de qualidade da água para tilápias
export const DEFAULT_PARAMETER_LIMITS = {
  pH: {
    minSafe: 6.5,
    maxSafe: 8.0,
    minCritical: 5.5,
    maxCritical: 9.0,
  },
  temperature: {
    minSafe: 26,
    maxSafe: 32,
    minCritical: 20,
    maxCritical: 35,
  },
  dissolvedOxygen: {
    minSafe: 5.0,
    maxSafe: 12.0,
    minCritical: 3.0,
    maxCritical: 15.0,
  },
  ammonia: {
    minSafe: 0,
    maxSafe: 0.5,
    minCritical: 0,
    maxCritical: 2.0,
  },
};

// Cores para indicadores visuais
export const INDICATOR_COLORS = {
  optimal: "#10b981", // verde
  warning: "#f59e0b", // amarelo
  critical: "#ef4444", // vermelho
  neutral: "#6b7280", // cinza
};

// Tipos de parâmetros
export const PARAMETER_TYPES = {
  pH: "pH",
  temperature: "Temperatura (°C)",
  dissolvedOxygen: "Oxigênio Dissolvido (mg/L)",
  ammonia: "Amônia (mg/L)",
} as const;

// Níveis de risco
export const RISK_LEVELS = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
} as const;

// Frequências de relatório
export const REPORT_FREQUENCIES = {
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
} as const;

import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  ChevronDown,
  DollarSign,
  Droplet,
  Package,
  TrendingUp,
  FileText,
  Zap,
  Settings,
  BarChart3,
  Utensils,
  Users,
  Clock,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModuleItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface Module {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  items: ModuleItem[];
}

const modules: Module[] = [
  {
    id: "home",
    title: "Início",
    icon: <Home className="h-5 w-5" />,
    color: "bg-blue-500",
    items: [
      {
        label: "Painel de Controle",
        href: "/home",
        icon: <BarChart3 className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "financial",
    title: "Financeiro",
    icon: <DollarSign className="h-5 w-5" />,
    color: "bg-green-500",
    items: [
      {
        label: "Dashboard Financeiro",
        href: "/financial",
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        label: "Terminal de Mercado",
        href: "/terminal",
        icon: <Activity className="h-4 w-4" />,
      },
      {
        label: "Lucros e Custos",
        href: "/financial",
        icon: <TrendingUp className="h-4 w-4" />,
      },
      {
        label: "Relatórios Financeiros",
        href: "/reports",
        icon: <FileText className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "tanks",
    title: "Tanques",
    icon: <Droplet className="h-5 w-5" />,
    color: "bg-blue-500",
    items: [
      {
        label: "Gerenciar Tanques",
        href: "/tanks",
        icon: <Droplet className="h-4 w-4" />,
      },
      {
        label: "Alimentação",
        href: "/feeding",
        icon: <Utensils className="h-4 w-4" />,
      },
      {
        label: "Parâmetros de Água",
        href: "/",
        icon: <Zap className="h-4 w-4" />,
      },
      {
        label: "Amostragem de Peso",
        href: "/tanks",
        icon: <BarChart3 className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "stock",
    title: "Estoque",
    icon: <Package className="h-5 w-5" />,
    color: "bg-orange-500",
    items: [
      {
        label: "Gestão de Estoque",
        href: "/stock",
        icon: <Package className="h-4 w-4" />,
      },
      {
        label: "Movimentações",
        href: "/stock",
        icon: <Clock className="h-4 w-4" />,
      },
      {
        label: "Alertas de Estoque",
        href: "/stock",
        icon: <Zap className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "suppliers",
    title: "Fornecedores",
    icon: <Users className="h-5 w-5" />,
    color: "bg-purple-500",
    items: [
      {
        label: "Comparação de Preços",
        href: "/suppliers",
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        label: "Histórico de Compras",
        href: "/suppliers",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        label: "Análise de Fornecedores",
        href: "/suppliers",
        icon: <BarChart3 className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "analytics",
    title: "Análises",
    icon: <TrendingUp className="h-5 w-5" />,
    color: "bg-indigo-500",
    items: [
      {
        label: "Insights e Previsões",
        href: "/insights",
        icon: <TrendingUp className="h-4 w-4" />,
      },
      {
        label: "Relatórios Gerais",
        href: "/reports",
        icon: <FileText className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "integrations",
    title: "Integrações",
    icon: <Zap className="h-5 w-5" />,
    color: "bg-pink-500",
    items: [
      {
        label: "Webhooks e Sensores",
        href: "/webhooks",
        icon: <Zap className="h-4 w-4" />,
      },
    ],
  },
];

export function ModuleSelector() {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(["home", "tanks"])
  );
  const [location] = useLocation();

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <div className="w-64 bg-background border-r border-border h-screen overflow-y-auto">
      <div className="p-4 space-y-2">
        <h2 className="text-lg font-bold text-foreground px-2 mb-6">Módulos</h2>

        {modules.map((module) => (
          <div key={module.id} className="space-y-1">
            {/* Module Header */}
            <button
              onClick={() => toggleModule(module.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors",
                "hover:bg-muted text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded", module.color, "text-white")}>
                  {module.icon}
                </div>
                <span className="font-medium text-sm">{module.title}</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expandedModules.has(module.id) ? "rotate-180" : ""
                )}
              />
            </button>

            {/* Module Items */}
            {expandedModules.has(module.id) && (
              <div className="space-y-1 pl-2">
                {module.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

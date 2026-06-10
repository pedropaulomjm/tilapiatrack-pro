import { Link } from "wouter";
import {
  DollarSign,
  Droplet,
  Package,
  TrendingUp,
  FileText,
  Zap,
  Users,
  BarChart3,
  Utensils,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ModuleCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  items: {
    label: string;
    href: string;
    icon: React.ReactNode;
  }[];
}

const moduleCategories: ModuleCategory[] = [
  {
    id: "financial",
    title: "Financeiro",
    description: "Gestão de lucros, custos e análises financeiras",
    icon: <DollarSign className="h-8 w-8" />,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    items: [
      {
        label: "Dashboard Financeiro",
        href: "/financial",
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        label: "Terminal de Mercado",
        href: "/terminal",
        icon: <TrendingUp className="h-4 w-4" />,
      },
      {
        label: "Relatórios Financeiros",
        href: "/reports",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        label: "Análise de Custos",
        href: "/financial",
        icon: <BarChart3 className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "tanks",
    title: "Tanques",
    description: "Monitoramento e controle de tanques de piscicultura",
    icon: <Droplet className="h-8 w-8" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    items: [
      {
        label: "Gerenciar Tanques",
        href: "/tanks",
        icon: <Droplet className="h-4 w-4" />,
      },
      {
        label: "Alimentação Automática",
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
    description: "Controle de inventário e movimentações",
    icon: <Package className="h-8 w-8" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
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
    description: "Comparação de preços e análise de fornecedores",
    icon: <Users className="h-8 w-8" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
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
    description: "Insights, previsões e relatórios gerais",
    icon: <TrendingUp className="h-8 w-8" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-200",
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
    description: "Webhooks e sensores IoT",
    icon: <Zap className="h-8 w-8" />,
    color: "text-pink-600",
    bgColor: "bg-pink-50 border-pink-200",
    items: [
      {
        label: "Webhooks e Sensores",
        href: "/webhooks",
        icon: <Zap className="h-4 w-4" />,
      },
    ],
  },
];

export default function ModulesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Módulos do Sistema</h1>
          <p className="text-lg text-muted-foreground">
            Acesse os diferentes módulos e funcionalidades da plataforma
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moduleCategories.map((category) => (
            <Card key={category.id} className={`${category.bgColor} border`}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-3 rounded-lg bg-white ${category.color}`}>
                    {category.icon}
                  </div>
                </div>
                <CardTitle className="text-xl">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a className="flex items-center justify-between p-3 rounded-lg hover:bg-white/50 transition-colors group">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Módulos Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{moduleCategories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Funcionalidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {moduleCategories.reduce((sum, cat) => sum + cat.items.length, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Páginas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">13+</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">Ativo</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

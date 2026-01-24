import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Droplet,
  Package,
  DollarSign,
  Utensils,
  ArrowRight,
  Activity,
  Clock,
} from "lucide-react";
import { Link } from "wouter";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function HomeDashboard() {
  const { isAuthenticated, loginUrl } = useAuth();
  const { data: tanks } = trpc.tanks.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bem-vindo ao TilapiaTrack Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Sistema inteligente de monitoramento de qualidade de água em pisciculturas.
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Painel de Controle</h1>
          <p className="text-muted-foreground">Resumo executivo e acesso rápido às principais funcionalidades</p>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Receita Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">R$ 320.000</div>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Custo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">R$ 185.000</div>
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +5% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Lucro Líquido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">R$ 135.000</div>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +18% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Droplet className="h-4 w-4" />
                Margem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">42.2%</div>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +2.5% vs mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas Críticos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Alertas Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900">Estoque Crítico</p>
                      <p className="text-sm text-red-800">Ração Premium 45% abaixo do nível mínimo (15 kg)</p>
                      <p className="text-xs text-red-700 mt-2">Há 5 minutos</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Ação
                    </Button>
                  </div>
                </div>

                <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-900">Parâmetro Fora do Ideal</p>
                      <p className="text-sm text-yellow-800">pH do Tanque 1 acima do limite (8.5)</p>
                      <p className="text-xs text-yellow-700 mt-2">Há 15 minutos</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Verificar
                    </Button>
                  </div>
                </div>

                <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-900">Oxigênio Dissolvido Baixo</p>
                      <p className="text-sm text-yellow-800">Tanque 2: 4.2 mg/L (mínimo: 5.0)</p>
                      <p className="text-xs text-yellow-700 mt-2">Há 8 minutos</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Verificar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status dos Tanques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5" />
                Status dos Tanques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Tanque 1</p>
                    <p className="text-xs text-muted-foreground">Engorda</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    Atenção
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Tanque 2</p>
                    <p className="text-xs text-muted-foreground">Juvenil</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    Atenção
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Tanque 3</p>
                    <p className="text-xs text-muted-foreground">Alevinagem</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    Normal
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Resumo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Financeira</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={[
                  { month: "Jan", receita: 45000, custo: 28000 },
                  { month: "Fev", receita: 52000, custo: 31000 },
                  { month: "Mar", receita: 48000, custo: 29000 },
                  { month: "Abr", receita: 58000, custo: 32000 },
                  { month: "Mai", receita: 62000, custo: 34000 },
                  { month: "Jun", receita: 55000, custo: 31000 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
                  <Legend />
                  <Line type="monotone" dataKey="receita" stroke="#10b981" name="Receita" />
                  <Line type="monotone" dataKey="custo" stroke="#ef4444" name="Custo" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Ração", value: 15000 },
                      { name: "Medicamentos", value: 3000 },
                      { name: "Energia", value: 2000 },
                      { name: "Mão de obra", value: 5000 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: R$ ${value.toLocaleString("pt-BR")}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Acesso Rápido */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido às Principais Funcionalidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/tanks">
                <a className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <Droplet className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Tanques</p>
                  <p className="text-xs text-muted-foreground mt-1">Gerenciar tanques</p>
                </a>
              </Link>

              <Link href="/feeding">
                <a className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <Utensils className="h-6 w-6 text-orange-600 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Alimentação</p>
                  <p className="text-xs text-muted-foreground mt-1">Programar alimentadores</p>
                </a>
              </Link>

              <Link href="/stock">
                <a className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Estoque</p>
                  <p className="text-xs text-muted-foreground mt-1">Controlar estoque</p>
                </a>
              </Link>

              <Link href="/financial">
                <a className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Financeiro</p>
                  <p className="text-xs text-muted-foreground mt-1">Análise financeira</p>
                </a>
              </Link>

              <Link href="/reports">
                <a className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Relatórios</p>
                  <p className="text-xs text-muted-foreground mt-1">Gerar relatórios</p>
                </a>
              </Link>

              <Link href="/insights">
                <a className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-6 w-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Insights</p>
                  <p className="text-xs text-muted-foreground mt-1">Análise preditiva</p>
                </a>
              </Link>

              <Link href="/suppliers">
                <a className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-6 w-6 text-cyan-600 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Fornecedores</p>
                  <p className="text-xs text-muted-foreground mt-1">Comparar preços</p>
                </a>
              </Link>

              <Link href="/webhooks">
                <a className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="h-6 w-6 text-pink-600 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Webhooks</p>
                  <p className="text-xs text-muted-foreground mt-1">Integrar sensores</p>
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

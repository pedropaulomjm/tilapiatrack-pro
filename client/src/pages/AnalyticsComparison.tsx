import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsComparison() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [selectedTankId, setSelectedTankId] = useState<number | null>(null);

  const { data: tanks, isLoading: tanksLoading } = trpc.tanks.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Faça login para visualizar análises.
            </p>
            <Button asChild className="w-full">
              <a href={loginUrl}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data for general analytics
  const generalAnalytics = {
    totalTanks: tanks?.length || 0,
    totalRationConsumed: 1250.5,
    totalCost: 3500.75,
    totalRevenue: 8500.0,
    averageMortality: 2.3,
    operationHealth: 87,
  };

  const racionConsumptionData = [
    { name: "Tanque 1", consumo: 150, limite: 200 },
    { name: "Tanque 2", consumo: 180, limite: 200 },
    { name: "Tanque 3", consumo: 120, limite: 150 },
    { name: "Tanque 4", consumo: 200, limite: 200 },
    { name: "Tanque 5", consumo: 100, limite: 150 },
  ];

  const costBreakdown = [
    { name: "Ração", value: 45, amount: 1575 },
    { name: "Energia", value: 20, amount: 700 },
    { name: "Manutenção", value: 15, amount: 525 },
    { name: "Medicamentos", value: 12, amount: 420 },
    { name: "Outros", value: 8, amount: 280 },
  ];

  const mortalityData = [
    { name: "Tanque 1", mortalidade: 1.5 },
    { name: "Tanque 2", mortalidade: 2.1 },
    { name: "Tanque 3", mortalidade: 1.8 },
    { name: "Tanque 4", mortalidade: 3.2 },
    { name: "Tanque 5", mortalidade: 1.9 },
  ];

  const profitabilityData = [
    { name: "Jan", receita: 1200, custo: 800 },
    { name: "Fev", receita: 1400, custo: 850 },
    { name: "Mar", receita: 1600, custo: 900 },
    { name: "Abr", receita: 1800, custo: 950 },
    { name: "Mai", receita: 2000, custo: 1000 },
    { name: "Jun", receita: 2200, custo: 1050 },
  ];

  const tankSpecificData = {
    name: "Tanque 1",
    volume: 5000,
    population: 2500,
    density: 0.5,
    stage: "Engorda",
    mortality: 1.5,
    feedConsumption: 150,
    projectedProfit: 2500,
    projectedCost: 1200,
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Análises e Comparações</h1>
          <p className="text-muted-foreground">
            Visualize análises gerais da operação e comparativas entre tanques
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Análise Geral</TabsTrigger>
            <TabsTrigger value="specific">Análise por Tanque</TabsTrigger>
          </TabsList>

          {/* GENERAL ANALYTICS */}
          <TabsContent value="general" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Saúde Operacional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{generalAnalytics.operationHealth}%</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <TrendingUp className="inline h-3 w-3 mr-1 text-green-600" />
                    +2% em relação ao mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">R$ {generalAnalytics.totalRevenue.toLocaleString('pt-BR')}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <TrendingUp className="inline h-3 w-3 mr-1 text-green-600" />
                    +15% em relação ao período anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">R$ {generalAnalytics.totalCost.toLocaleString('pt-BR')}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <TrendingDown className="inline h-3 w-3 mr-1 text-red-600" />
                    +8% em relação ao período anterior
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ração Consumption */}
              <Card>
                <CardHeader>
                  <CardTitle>Consumo de Ração por Tanque</CardTitle>
                  <CardDescription>Comparativo com limite diário</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={racionConsumptionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="consumo" fill="#3b82f6" name="Consumo (kg)" />
                      <Bar dataKey="limite" fill="#e5e7eb" name="Limite (kg)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Custos</CardTitle>
                  <CardDescription>Percentual por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={costBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} (${value}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {costBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Mortality Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Mortalidade por Tanque</CardTitle>
                  <CardDescription>Percentual de mortalidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mortalityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="mortalidade" fill="#ef4444" name="Mortalidade (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Profitability Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Lucratividade</CardTitle>
                  <CardDescription>Receita vs Custo (últimos 6 meses)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={profitabilityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="receita"
                        stroke="#10b981"
                        name="Receita (R$)"
                      />
                      <Line
                        type="monotone"
                        dataKey="custo"
                        stroke="#ef4444"
                        name="Custo (R$)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SPECIFIC TANK ANALYTICS */}
          <TabsContent value="specific" className="space-y-6">
            {/* Tank Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Selecione um Tanque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {tanks?.map((tank: any) => (
                    <Button
                      key={tank.id}
                      variant={selectedTankId === tank.id ? "default" : "outline"}
                      onClick={() => setSelectedTankId(tank.id)}
                      className="w-full"
                    >
                      {tank.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedTankId && (
              <>
                {/* Tank KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tankSpecificData.volume.toLocaleString()} L</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">População</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tankSpecificData.population.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Densidade: {tankSpecificData.density} peixe/L
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Mortalidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{tankSpecificData.mortality}%</div>
                      <p className="text-xs text-muted-foreground mt-2">Taxa acumulada</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Fase</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tankSpecificData.stage}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Consumo de Ração</CardTitle>
                      <CardDescription>Últimos 30 dias</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{tankSpecificData.feedConsumption} kg</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Média diária: {(tankSpecificData.feedConsumption / 30).toFixed(1)} kg
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Projeção Financeira</CardTitle>
                      <CardDescription>Fim do ciclo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Receita Projetada:</span>
                          <span className="font-bold text-green-600">
                            R$ {tankSpecificData.projectedProfit.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Custo Projetado:</span>
                          <span className="font-bold text-red-600">
                            R$ {tankSpecificData.projectedCost.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="text-sm font-medium">Lucro Projetado:</span>
                          <span className="font-bold text-blue-600">
                            R$ {(tankSpecificData.projectedProfit - tankSpecificData.projectedCost).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

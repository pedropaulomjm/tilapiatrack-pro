import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function FinancialDashboard() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("ração");
  const [type, setType] = useState("expense");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Faça login para acessar o dashboard financeiro.
            </p>
            <Button asChild className="w-full">
              <a href={loginUrl}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const costData = [
    { name: "Ração", value: 15000, type: "direto" },
    { name: "Medicamentos", value: 3000, type: "direto" },
    { name: "Energia", value: 2000, type: "indireto" },
    { name: "Mão de obra", value: 5000, type: "indireto" },
    { name: "Manutenção", value: 1500, type: "fixo" },
  ];

  const monthlyData = [
    { month: "Jan", receita: 45000, custo: 28000, lucro: 17000 },
    { month: "Fev", receita: 52000, custo: 31000, lucro: 21000 },
    { month: "Mar", receita: 48000, custo: 29000, lucro: 19000 },
    { month: "Abr", receita: 58000, custo: 32000, lucro: 26000 },
    { month: "Mai", receita: 62000, custo: 34000, lucro: 28000 },
    { month: "Jun", receita: 55000, custo: 31000, lucro: 24000 },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">Análise de custos, receitas e KPIs</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ 320.000</div>
              <p className="text-xs text-green-600 mt-1">+12% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Custo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ 185.000</div>
              <p className="text-xs text-red-600 mt-1">+5% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ 135.000</div>
              <p className="text-xs text-green-600 mt-1">+18% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Margem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">42.2%</div>
              <p className="text-xs text-green-600 mt-1">+2.5% vs mês anterior</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="costs">Custos</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
                    <Legend />
                    <Line type="monotone" dataKey="receita" stroke="#10b981" name="Receita" />
                    <Line type="monotone" dataKey="custo" stroke="#ef4444" name="Custo" />
                    <Line type="monotone" dataKey="lucro" stroke="#3b82f6" name="Lucro" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Custos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={costData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: R$ ${value.toLocaleString("pt-BR")}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {costData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custos por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={costData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transações */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Registrar Transação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo</Label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full border border-border rounded-md p-2 bg-background"
                      >
                        <option value="expense">Despesa</option>
                        <option value="income">Receita</option>
                      </select>
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-border rounded-md p-2 bg-background"
                      >
                        <option value="ração">Ração</option>
                        <option value="medicamentos">Medicamentos</option>
                        <option value="energia">Energia</option>
                        <option value="mão-de-obra">Mão de obra</option>
                        <option value="venda">Venda de peixe</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-foreground">Compra de Ração</p>
                        <p className="text-sm text-muted-foreground">24/01/2026</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">-R$ 5.000</p>
                      <Button variant="ghost" size="sm">Remover</Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-foreground">Venda de Peixe</p>
                        <p className="text-sm text-muted-foreground">23/01/2026</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+R$ 12.500</p>
                      <Button variant="ghost" size="sm">Remover</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custos */}
          <TabsContent value="costs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Custos</CardTitle>
                <CardDescription>
                  Separação entre custos fixos/variáveis e diretos/indiretos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Custos Fixos</p>
                    <p className="text-2xl font-bold text-foreground">R$ 6.500</p>
                    <p className="text-xs text-muted-foreground mt-2">3.5% do total</p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Custos Variáveis</p>
                    <p className="text-2xl font-bold text-foreground">R$ 178.500</p>
                    <p className="text-xs text-muted-foreground mt-2">96.5% do total</p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Custos Diretos</p>
                    <p className="text-2xl font-bold text-foreground">R$ 150.000</p>
                    <p className="text-xs text-muted-foreground mt-2">81% do total</p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Custos Indiretos</p>
                    <p className="text-2xl font-bold text-foreground">R$ 35.000</p>
                    <p className="text-xs text-muted-foreground mt-2">19% do total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

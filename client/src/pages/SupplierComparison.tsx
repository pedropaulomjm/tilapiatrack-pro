import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingDown, TrendingUp, DollarSign, Zap } from "lucide-react";

export default function SupplierComparison() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [selectedItem, setSelectedItem] = useState("ração");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Faça login para acessar a comparação de fornecedores.
            </p>
            <Button asChild className="w-full">
              <a href={loginUrl}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const priceHistoryData = [
    { date: "01/01", fornecedor1: 2.40, fornecedor2: 2.55, fornecedor3: 2.50 },
    { date: "08/01", fornecedor1: 2.45, fornecedor2: 2.50, fornecedor3: 2.48 },
    { date: "15/01", fornecedor1: 2.50, fornecedor2: 2.48, fornecedor3: 2.52 },
    { date: "22/01", fornecedor1: 2.55, fornecedor2: 2.45, fornecedor3: 2.50 },
    { date: "24/01", fornecedor1: 2.50, fornecedor2: 2.42, fornecedor3: 2.48 },
  ];

  const supplierStats = [
    {
      id: 1,
      name: "Fornecedor ABC",
      currentPrice: 2.50,
      avgPrice: 2.48,
      minPrice: 2.40,
      maxPrice: 2.55,
      totalCompras: 45,
      volume: "2.250 kg",
      gastTotal: "5.625",
      trend: "up",
      trendPercent: 2.5,
    },
    {
      id: 2,
      name: "Fornecedor XYZ",
      currentPrice: 2.42,
      avgPrice: 2.48,
      minPrice: 2.42,
      maxPrice: 2.55,
      totalCompras: 38,
      volume: "1.900 kg",
      gastTotal: "4.598",
      trend: "down",
      trendPercent: -2.8,
    },
    {
      id: 3,
      name: "Fornecedor DEF",
      currentPrice: 2.48,
      avgPrice: 2.50,
      minPrice: 2.48,
      maxPrice: 2.52,
      totalCompras: 32,
      volume: "1.600 kg",
      gastTotal: "3.968",
      trend: "stable",
      trendPercent: 0.0,
    },
  ];

  const comparisonData = [
    {
      supplier: "ABC",
      preço: 2.50,
      qualidade: 8.5,
      prazo: 7,
      confiabilidade: 9.0,
    },
    {
      supplier: "XYZ",
      preço: 2.42,
      qualidade: 7.8,
      prazo: 5,
      confiabilidade: 8.5,
    },
    {
      supplier: "DEF",
      preço: 2.48,
      qualidade: 9.0,
      prazo: 10,
      confiabilidade: 8.0,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Comparação de Fornecedores</h1>
          <p className="text-muted-foreground">Análise histórica de preços e recomendações</p>
        </div>

        {/* Seletor de Item */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecionar Item</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ração">Ração Premium 45%</SelectItem>
                <SelectItem value="medicamentos">Medicamento A</SelectItem>
                <SelectItem value="vitaminas">Vitaminas e Minerais</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Histórico de Preços */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Histórico de Preços - Últimos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${typeof value === 'number' ? value.toFixed(2) : value}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fornecedor1"
                  stroke="#3b82f6"
                  name="Fornecedor ABC"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="fornecedor2"
                  stroke="#10b981"
                  name="Fornecedor XYZ"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="fornecedor3"
                  stroke="#f59e0b"
                  name="Fornecedor DEF"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Estatísticas de Fornecedores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {supplierStats.map((supplier) => (
            <Card key={supplier.id}>
              <CardHeader>
                <CardTitle className="text-lg">{supplier.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Preço Atual</p>
                    <p className="text-2xl font-bold text-foreground">R$ {supplier.currentPrice.toFixed(2)}</p>
                  </div>
                  {supplier.trend === "up" ? (
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">+{supplier.trendPercent}%</span>
                    </div>
                  ) : supplier.trend === "down" ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm font-medium">{supplier.trendPercent}%</span>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-muted-foreground">Estável</div>
                  )}
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preço Médio</span>
                    <span className="font-medium">R$ {supplier.avgPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mín/Máx</span>
                    <span className="font-medium">
                      R$ {supplier.minPrice.toFixed(2)} / R$ {supplier.maxPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total de Compras</span>
                    <span className="font-medium">{supplier.totalCompras}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Volume</span>
                    <span className="font-medium">{supplier.volume}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gasto Total</span>
                    <span className="font-medium">R$ {supplier.gastTotal}</span>
                  </div>
                </div>

                <Button className="w-full mt-4">Solicitar Orçamento</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabela Comparativa */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Comparativo Detalhado</CardTitle>
            <CardDescription>Preço, qualidade, prazo e confiabilidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Preço (R$/kg)</TableHead>
                    <TableHead>Qualidade</TableHead>
                    <TableHead>Prazo (dias)</TableHead>
                    <TableHead>Confiabilidade</TableHead>
                    <TableHead>Score Geral</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonData.map((supplier) => {
                    const scoreGeral = (
                      (10 - supplier.preço * 2) +
                      supplier.qualidade +
                      (10 - supplier.prazo) +
                      supplier.confiabilidade
                    ) / 4;

                    return (
                      <TableRow key={supplier.supplier}>
                        <TableCell className="font-medium">{supplier.supplier}</TableCell>
                        <TableCell>
                          <span className="font-semibold">R$ {supplier.preço.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(supplier.qualidade / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{supplier.qualidade}</span>
                          </div>
                        </TableCell>
                        <TableCell>{supplier.prazo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${(supplier.confiabilidade / 10) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{supplier.confiabilidade}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-lg">{scoreGeral.toFixed(1)}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Análise Comparativa */}
        <Card>
          <CardHeader>
            <CardTitle>Análise de Economia Potencial</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="supplier" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="preço" fill="#3b82f6" name="Preço (R$/kg)" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="qualidade"
                  stroke="#10b981"
                  name="Qualidade"
                />
              </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3">
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <p className="font-semibold text-green-900 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Recomendação
                </p>
                <p className="text-sm text-green-800 mt-2">
                  <strong>Fornecedor XYZ</strong> oferece o melhor preço (R$ 2.42/kg) com boa qualidade (7.8/10). Potencial de economia: <strong>R$ 360</strong> em 1.500 kg de ração.
                </p>
              </div>

              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <p className="font-semibold text-blue-900">Análise Histórica</p>
                <p className="text-sm text-blue-800 mt-2">
                  Nos últimos 30 dias, o preço médio foi <strong>R$ 2.48/kg</strong>. O preço atual do Fornecedor XYZ (R$ 2.42/kg) está <strong>2.4% abaixo da média</strong>, representando uma boa oportunidade de compra.
                </p>
              </div>

              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <p className="font-semibold text-yellow-900">Tendência de Preços</p>
                <p className="text-sm text-yellow-800 mt-2">
                  Os preços estão em tendência de queda. Recomenda-se <strong>aumentar o volume de compra</strong> com o Fornecedor XYZ enquanto os preços estão baixos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

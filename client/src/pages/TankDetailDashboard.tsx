import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, Camera, Droplet, TrendingUp } from "lucide-react";

export default function TankDetailDashboard() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [selectedTankId, setSelectedTankId] = useState<number | null>(null);

  const { data: tanks } = trpc.tanks.list.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">Faça login para acessar dashboard de tanques.</p>
            <Button asChild className="w-full">
              <a href={loginUrl}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tankData = {
    name: "Tanque 1",
    volume: 5000,
    population: 2500,
    stage: "Engorda",
    currentCost: 1250.75,
    projectedCost: 1800.0,
    projectedRevenue: 4500.0,
    projectedProfit: 2700.0,
  };

  const waterParameters = [
    { time: "08:00", pH: 7.2, temp: 28, OD: 6.5, ammonia: 0.2 },
    { time: "10:00", pH: 7.3, temp: 28.5, OD: 6.8, ammonia: 0.15 },
    { time: "12:00", pH: 7.1, temp: 29, OD: 6.2, ammonia: 0.25 },
    { time: "14:00", pH: 7.4, temp: 29.5, OD: 6.9, ammonia: 0.1 },
    { time: "16:00", pH: 7.2, temp: 28.8, OD: 7.1, ammonia: 0.2 },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard de Tanque</h1>
          <p className="text-muted-foreground">
            Visualize detalhes, custos, câmera e parâmetros em tempo real
          </p>
        </div>

        {/* Tank Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecione um Tanque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Custo Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {tankData.currentCost.toLocaleString("pt-BR")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Até o momento</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Custo Esperado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    R$ {tankData.projectedCost.toLocaleString("pt-BR")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Fim do ciclo</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Receita Projetada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {tankData.projectedRevenue.toLocaleString("pt-BR")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Venda estimada</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Lucro Projetado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {tankData.projectedProfit.toLocaleString("pt-BR")}
                    </div>
                    <TrendingUp className="h-5 w-5 text-blue-600 ml-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Margem esperada</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="camera" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="camera">Câmera</TabsTrigger>
                <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
              </TabsList>

              {/* Camera Tab */}
              <TabsContent value="camera" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Feed de Câmera ao Vivo
                    </CardTitle>
                    <CardDescription>Visualização em tempo real do tanque</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Feed de câmera</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Conecte uma câmera RTMP/HLS para visualizar ao vivo
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✓ Câmera conectada e transmitindo normalmente
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Parameters Tab */}
              <TabsContent value="parameters" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplet className="h-5 w-5" />
                      Parâmetros de Água em Tempo Real
                    </CardTitle>
                    <CardDescription>Medições dos sensores IoT</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Parameters */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-muted-foreground">pH</p>
                        <p className="text-2xl font-bold text-blue-600">7.2</p>
                        <p className="text-xs text-muted-foreground mt-1">Ideal: 6.5-8.0</p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-muted-foreground">Temperatura</p>
                        <p className="text-2xl font-bold text-orange-600">28.5°C</p>
                        <p className="text-xs text-muted-foreground mt-1">Ideal: 24-32°C</p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-muted-foreground">OD</p>
                        <p className="text-2xl font-bold text-green-600">6.8 mg/L</p>
                        <p className="text-xs text-muted-foreground mt-1">Mín: 5.0 mg/L</p>
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-muted-foreground">Amônia</p>
                        <p className="text-2xl font-bold text-red-600">0.15 mg/L</p>
                        <p className="text-xs text-muted-foreground mt-1">Máx: 0.5 mg/L</p>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="mt-6">
                      <h3 className="font-semibold mb-4">Histórico das Últimas 8 Horas</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={waterParameters}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="pH"
                            stroke="#3b82f6"
                            name="pH"
                          />
                          <Line
                            type="monotone"
                            dataKey="temp"
                            stroke="#f59e0b"
                            name="Temperatura (°C)"
                          />
                          <Line
                            type="monotone"
                            dataKey="OD"
                            stroke="#10b981"
                            name="OD (mg/L)"
                          />
                          <Line
                            type="monotone"
                            dataKey="ammonia"
                            stroke="#ef4444"
                            name="Amônia (mg/L)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Tanque</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-semibold">{tankData.name}</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Volume</p>
                        <p className="font-semibold">{tankData.volume.toLocaleString()} L</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">População</p>
                        <p className="font-semibold">{tankData.population.toLocaleString()} peixes</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Fase</p>
                        <p className="font-semibold">{tankData.stage}</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Densidade</p>
                        <p className="font-semibold">
                          {(tankData.population / tankData.volume).toFixed(2)} peixe/L
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-semibold text-green-600">Ativo</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ParameterIndicator } from "@/components/ParameterIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Plus, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DEFAULT_PARAMETER_LIMITS, PARAMETER_TYPES } from "@shared/constants";

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated, loginUrl } = useAuth();
  const [selectedTankId, setSelectedTankId] = useState<number | null>(null);

  // Queries
  const { data: tanks, isLoading: tanksLoading } = trpc.tanks.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (tanks && tanks.length > 0 && !selectedTankId) {
      setSelectedTankId(tanks[0].id);
    }
  }, [tanks, selectedTankId]);

  const { data: latestData } = trpc.waterQuality.getLatest.useQuery(
    { tankId: selectedTankId! },
    { enabled: !!selectedTankId }
  );

  const { data: parameterLimits } = trpc.parameterLimits.getByTank.useQuery(
    { tankId: selectedTankId! },
    { enabled: !!selectedTankId }
  );

  const { data: unresolvedAlerts } = trpc.alerts.getByTank.useQuery(
    { tankId: selectedTankId!, unresolved: true },
    { enabled: !!selectedTankId }
  );

  const { data: prediction } = trpc.predictions.getLatest.useQuery(
    { tankId: selectedTankId! },
    { enabled: !!selectedTankId }
  );

  const { data: historicalData } = trpc.waterQuality.getRange.useQuery(
    {
      tankId: selectedTankId!,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
    { enabled: !!selectedTankId }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>TilapiaTrack Pro</CardTitle>
            <CardDescription>Sistema de Monitoramento de Qualidade da Água</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Faça login para acessar o dashboard de monitoramento de seus tanques.
            </p>
            <Button asChild className="w-full">
              <a href={loginUrl}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tanksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando tanques...</p>
        </div>
      </div>
    );
  }

  if (!tanks || tanks.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo ao TilapiaTrack Pro</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Nenhum tanque cadastrado</CardTitle>
              <CardDescription>
                Comece criando seu primeiro tanque para iniciar o monitoramento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/tanks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Tanque
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentTank = tanks.find(t => t.id === selectedTankId);
  const limits = parameterLimits?.reduce((acc, limit) => {
    acc[limit.parameter] = limit;
    return acc;
  }, {} as Record<string, any>) || {};

  const chartData = historicalData?.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    pH: d.pH ? Number(d.pH) : null,
    temperature: d.temperature ? Number(d.temperature) : null,
    dissolvedOxygen: d.dissolvedOxygen ? Number(d.dissolvedOxygen) : null,
    ammonia: d.ammonia ? Number(d.ammonia) : null,
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Monitoramento em tempo real da qualidade da água</p>
        </div>

        {/* Tank Selector */}
        <div className="mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-2 block">Selecionar Tanque</label>
            <Select value={selectedTankId?.toString()} onValueChange={(val) => setSelectedTankId(Number(val))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tanks.map(tank => (
                  <SelectItem key={tank.id} value={tank.id.toString()}>
                    {tank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button asChild variant="outline">
            <Link href={`/tanks/${selectedTankId}/settings`}>Configurar</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/tanks/new">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Alerts Section */}
        {unresolvedAlerts && unresolvedAlerts.length > 0 && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Alertas Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {unresolvedAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-background rounded border border-destructive/20">
                    <div>
                      <p className="font-medium text-foreground">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.parameter}: {alert.value} ({alert.alertType})
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">Resolver</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Assessment */}
        {prediction && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análise Preditiva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nível de Risco</p>
                  <p className={`text-lg font-bold ${
                    prediction.riskLevel === "high" ? "text-destructive" :
                    prediction.riskLevel === "medium" ? "text-yellow-600" :
                    "text-green-600"
                  }`}>
                    {prediction.riskLevel.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                  <p className="text-foreground">{prediction.riskDescription}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recomendações</p>
                  <p className="text-foreground">{prediction.recommendations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parameter Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ParameterIndicator
            label="pH"
            value={latestData?.pH ? Number(latestData.pH) : null}
            unit=""
            minSafe={limits.pH?.minSafe}
            maxSafe={limits.pH?.maxSafe}
            minCritical={limits.pH?.minCritical}
            maxCritical={limits.pH?.maxCritical}
          />
          <ParameterIndicator
            label="Temperatura"
            value={latestData?.temperature ? Number(latestData.temperature) : null}
            unit="°C"
            minSafe={limits.temperature?.minSafe}
            maxSafe={limits.temperature?.maxSafe}
            minCritical={limits.temperature?.minCritical}
            maxCritical={limits.temperature?.maxCritical}
          />
          <ParameterIndicator
            label="Oxigênio Dissolvido"
            value={latestData?.dissolvedOxygen ? Number(latestData.dissolvedOxygen) : null}
            unit="mg/L"
            minSafe={limits.dissolvedOxygen?.minSafe}
            maxSafe={limits.dissolvedOxygen?.maxSafe}
            minCritical={limits.dissolvedOxygen?.minCritical}
            maxCritical={limits.dissolvedOxygen?.maxCritical}
          />
          <ParameterIndicator
            label="Amônia"
            value={latestData?.ammonia ? Number(latestData.ammonia) : null}
            unit="mg/L"
            minSafe={limits.ammonia?.minSafe}
            maxSafe={limits.ammonia?.maxSafe}
            minCritical={limits.ammonia?.minCritical}
            maxCritical={limits.ammonia?.maxCritical}
          />
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tendência dos Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="#ef4444" name="Temperatura (°C)" />
                  <Line type="monotone" dataKey="pH" stroke="#3b82f6" name="pH" />
                  <Line type="monotone" dataKey="dissolvedOxygen" stroke="#10b981" name="O.D. (mg/L)" />
                  <Line type="monotone" dataKey="ammonia" stroke="#f59e0b" name="Amônia (mg/L)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

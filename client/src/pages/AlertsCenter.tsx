import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  AlertCircle,
  AlertTriangle,
  Droplet,
  Package,
  Utensils,
  TrendingDown,
  ChevronRight,
} from "lucide-react";

export default function AlertsCenter() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">Faça login para acessar centro de alertas.</p>
            <Button asChild className="w-full">
              <a href={loginUrl}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mockAlerts = {
    critical: [
      {
        id: "alert-1",
        type: "water-parameter",
        tank: "Tanque 1",
        parameter: "Oxigênio Dissolvido",
        value: "3.2 mg/L",
        limit: "5.0 mg/L",
        severity: "critical",
        timestamp: "Há 5 minutos",
        actionPath: "/tank-detail",
        actionLabel: "Ir para Dashboard",
      },
      {
        id: "alert-2",
        type: "stock",
        item: "Ração Premium",
        quantity: "50 kg",
        minimum: "200 kg",
        severity: "critical",
        timestamp: "Há 2 horas",
        actionPath: "/stock",
        actionLabel: "Comprar Estoque",
      },
    ],
    warning: [
      {
        id: "alert-3",
        type: "water-parameter",
        tank: "Tanque 2",
        parameter: "pH",
        value: "8.2",
        limit: "6.5-8.0",
        severity: "warning",
        timestamp: "Há 30 minutos",
        actionPath: "/tank-detail",
        actionLabel: "Verificar",
      },
      {
        id: "alert-4",
        type: "mortality",
        tank: "Tanque 3",
        rate: "2.5%",
        expected: "< 1%",
        severity: "warning",
        timestamp: "Hoje",
        actionPath: "/tank-detail",
        actionLabel: "Investigar",
      },
      {
        id: "alert-5",
        type: "stock",
        item: "Medicamento A",
        quantity: "10 unidades",
        minimum: "50 unidades",
        severity: "warning",
        timestamp: "Há 1 dia",
        actionPath: "/stock",
        actionLabel: "Reabastecer",
      },
    ],
    info: [
      {
        id: "alert-6",
        type: "feeding",
        tank: "Tanque 1",
        message: "Alimentação programada para 14:00",
        severity: "info",
        timestamp: "Próximas 2 horas",
        actionPath: "/feeding",
        actionLabel: "Verificar Programação",
      },
      {
        id: "alert-7",
        type: "report",
        message: "Relatório semanal pronto para download",
        severity: "info",
        timestamp: "Há 1 hora",
        actionPath: "/reports",
        actionLabel: "Baixar Relatório",
      },
    ],
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  const renderAlert = (alert: any) => {
    if (dismissedAlerts.includes(alert.id)) return null;

    const iconMap = {
      critical: <AlertCircle className="h-5 w-5 text-red-600" />,
      warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      info: <AlertTriangle className="h-5 w-5 text-blue-600" />,
    };

    const bgColorMap: Record<string, string> = {
      critical: "bg-red-50 border-red-200",
      warning: "bg-yellow-50 border-yellow-200",
      info: "bg-blue-50 border-blue-200",
    };

    return (
      <Card key={alert.id} className={`border ${bgColorMap[alert.severity] || ""} mb-3`}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 pt-0.5">{(iconMap as any)[alert.severity]}</div>

            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {alert.tank && `${alert.tank} - `}
                    {alert.parameter || alert.item || alert.message}
                  </h4>

                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {alert.value && (
                      <p>
                        Valor atual: <span className="font-medium">{alert.value}</span>
                        {alert.limit && ` (Limite: ${alert.limit})`}
                      </p>
                    )}
                    {alert.quantity && (
                      <p>
                        Quantidade: <span className="font-medium">{alert.quantity}</span>
                        {alert.minimum && ` (Mínimo: ${alert.minimum})`}
                      </p>
                    )}
                    {alert.rate && (
                      <p>
                        Taxa de mortalidade: <span className="font-medium">{alert.rate}</span>
                        {alert.expected && ` (Esperado: ${alert.expected})`}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">{alert.timestamp}</p>
                </div>

                <Badge variant="outline" className="flex-shrink-0">
                  {alert.severity === "critical"
                    ? "Crítico"
                    : alert.severity === "warning"
                      ? "Aviso"
                      : "Info"}
                </Badge>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant={alert.severity === "critical" ? "destructive" : "default"}
                  onClick={() => {
                    // Navigate to action path
                    window.location.href = alert.actionPath;
                  }}
                  className="gap-1"
                >
                  {alert.actionLabel}
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDismiss(alert.id)}
                >
                  Descartar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const criticalCount = mockAlerts.critical.filter((a) => !dismissedAlerts.includes(a.id)).length;
  const warningCount = mockAlerts.warning.filter((a) => !dismissedAlerts.includes(a.id)).length;
  const infoCount = mockAlerts.info.filter((a) => !dismissedAlerts.includes(a.id)).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Centro de Alertas", path: "/alerts" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Centro de Alertas</h1>
          <p className="text-muted-foreground">
            Gerencie todos os alertas do sistema com ações diretas para solução
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Avisos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                Informativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Tabs */}
        <Tabs defaultValue="critical" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="critical" className="gap-2">
              Críticos
              {criticalCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {criticalCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="warning" className="gap-2">
              Avisos
              {warningCount > 0 && (
                <Badge variant="outline" className="ml-2">
                  {warningCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="info" className="gap-2">
              Informativos
              {infoCount > 0 && (
                <Badge variant="outline" className="ml-2">
                  {infoCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="critical" className="mt-6">
            {criticalCount === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum alerta crítico no momento</p>
                </CardContent>
              </Card>
            ) : (
              <div>{mockAlerts.critical.map(renderAlert)}</div>
            )}
          </TabsContent>

          <TabsContent value="warning" className="mt-6">
            {warningCount === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum aviso no momento</p>
                </CardContent>
              </Card>
            ) : (
              <div>{mockAlerts.warning.map(renderAlert)}</div>
            )}
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            {infoCount === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma informação no momento</p>
                </CardContent>
              </Card>
            ) : (
              <div>{mockAlerts.info.map(renderAlert)}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

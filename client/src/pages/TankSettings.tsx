import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DEFAULT_PARAMETER_LIMITS, PARAMETER_TYPES } from "@shared/constants";
import { useRoute } from "wouter";

export default function TankSettings() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [match, params] = useRoute("/tanks/:id/settings");
  const tankId = match ? Number(params?.id) : null;

  const [limits, setLimits] = useState<Record<string, any>>({});

  const { data: tank } = trpc.tanks.getById.useQuery(
    { id: tankId! },
    { enabled: !!tankId && isAuthenticated }
  );

  const { data: parameterLimits } = trpc.parameterLimits.getByTank.useQuery(
    { tankId: tankId! },
    { enabled: !!tankId && isAuthenticated }
  );

  const setLimitMutation = trpc.parameterLimits.set.useMutation({
    onSuccess: () => {
      toast.success("Limite atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar limite: ${error.message}`);
    },
  });

  useEffect(() => {
    if (parameterLimits) {
      const limitsMap: Record<string, any> = {};
      parameterLimits.forEach(limit => {
        limitsMap[limit.parameter] = limit;
      });
      setLimits(limitsMap);
    }
  }, [parameterLimits]);

  const handleLimitChange = (parameter: string, field: string, value: string) => {
    setLimits(prev => ({
      ...prev,
      [parameter]: {
        ...prev[parameter],
        [field]: value ? Number(value) : null,
      },
    }));
  };

  const handleSaveLimits = (parameter: string) => {
    const limit = limits[parameter];
    if (!limit || limit.minSafe === null || limit.maxSafe === null) {
      toast.error("Preencha os valores mínimo e máximo seguro");
      return;
    }

    setLimitMutation.mutate({
      tankId: tankId!,
      parameter: parameter as any,
      minSafe: limit.minSafe,
      maxSafe: limit.maxSafe,
      minCritical: limit.minCritical,
      maxCritical: limit.maxCritical,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Faça login para acessar as configurações.
            </p>
            <Button asChild className="w-full">
              <a href={loginUrl}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tank) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const parameters = ["pH", "temperature", "dissolvedOxygen", "ammonia"] as const;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações - {tank.name}</h1>
          <p className="text-muted-foreground">Configure os limites de parâmetros de qualidade da água</p>
        </div>

        <Tabs defaultValue="pH" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {parameters.map(param => (
              <TabsTrigger key={param} value={param}>
                {param === "pH" ? "pH" : 
                 param === "temperature" ? "Temp." :
                 param === "dissolvedOxygen" ? "O.D." :
                 "Amônia"}
              </TabsTrigger>
            ))}
          </TabsList>

          {parameters.map(parameter => (
            <TabsContent key={parameter} value={parameter}>
              <Card>
                <CardHeader>
                  <CardTitle>{PARAMETER_TYPES[parameter]}</CardTitle>
                  <CardDescription>
                    Configure os limites seguros e críticos para este parâmetro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Valores Seguros */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Limites Seguros</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${parameter}-minSafe`}>Mínimo Seguro</Label>
                          <Input
                            id={`${parameter}-minSafe`}
                            type="number"
                            step="0.01"
                            value={limits[parameter]?.minSafe ?? DEFAULT_PARAMETER_LIMITS[parameter as keyof typeof DEFAULT_PARAMETER_LIMITS]?.minSafe ?? ""}
                            onChange={(e) => handleLimitChange(parameter, "minSafe", e.target.value)}
                            placeholder="Ex: 6.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${parameter}-maxSafe`}>Máximo Seguro</Label>
                          <Input
                            id={`${parameter}-maxSafe`}
                            type="number"
                            step="0.01"
                            value={limits[parameter]?.maxSafe ?? DEFAULT_PARAMETER_LIMITS[parameter as keyof typeof DEFAULT_PARAMETER_LIMITS]?.maxSafe ?? ""}
                            onChange={(e) => handleLimitChange(parameter, "maxSafe", e.target.value)}
                            placeholder="Ex: 8.0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Valores Críticos */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Limites Críticos (Opcional)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${parameter}-minCritical`}>Mínimo Crítico</Label>
                          <Input
                            id={`${parameter}-minCritical`}
                            type="number"
                            step="0.01"
                            value={limits[parameter]?.minCritical ?? DEFAULT_PARAMETER_LIMITS[parameter as keyof typeof DEFAULT_PARAMETER_LIMITS]?.minCritical ?? ""}
                            onChange={(e) => handleLimitChange(parameter, "minCritical", e.target.value)}
                            placeholder="Ex: 5.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${parameter}-maxCritical`}>Máximo Crítico</Label>
                          <Input
                            id={`${parameter}-maxCritical`}
                            type="number"
                            step="0.01"
                            value={limits[parameter]?.maxCritical ?? DEFAULT_PARAMETER_LIMITS[parameter as keyof typeof DEFAULT_PARAMETER_LIMITS]?.maxCritical ?? ""}
                            onChange={(e) => handleLimitChange(parameter, "maxCritical", e.target.value)}
                            placeholder="Ex: 9.0"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSaveLimits(parameter)}
                      disabled={setLimitMutation.isPending}
                      className="w-full"
                    >
                      {setLimitMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

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
import { AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Insights() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [selectedTankId, setSelectedTankId] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: tanks } = trpc.tanks.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: prediction } = trpc.predictions.getLatest.useQuery(
    { tankId: selectedTankId! },
    { enabled: !!selectedTankId && isAuthenticated }
  );

  const analyzeMutation = trpc.predictions.analyze.useMutation({
    onSuccess: () => {
      toast.success("Análise concluída com sucesso!");
      setIsAnalyzing(false);
    },
    onError: (error) => {
      toast.error(`Erro na análise: ${error.message}`);
      setIsAnalyzing(false);
    },
  });

  const handleAnalyze = () => {
    if (!selectedTankId) {
      toast.error("Selecione um tanque");
      return;
    }

    setIsAnalyzing(true);
    analyzeMutation.mutate({ tankId: selectedTankId });
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
              Faça login para acessar os insights.
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Análise Preditiva</h1>
          <p className="text-muted-foreground">Insights baseados em IA para prevenção de riscos</p>
        </div>

        {/* Tank Selector and Analysis Button */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Executar Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Selecionar Tanque</label>
                <Select value={selectedTankId?.toString()} onValueChange={(val) => setSelectedTankId(Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tanque" />
                  </SelectTrigger>
                  <SelectContent>
                    {tanks?.map(tank => (
                      <SelectItem key={tank.id} value={tank.id.toString()}>
                        {tank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <p className="text-sm text-muted-foreground">
                A análise utiliza os últimos 30 dias de dados para identificar padrões e prever riscos de mortalidade de peixes.
              </p>

              <Button
                onClick={handleAnalyze}
                disabled={!selectedTankId || isAnalyzing || analyzeMutation.isPending}
                className="w-full"
              >
                <Zap className="mr-2 h-4 w-4" />
                {isAnalyzing || analyzeMutation.isPending ? "Analisando..." : "Executar Análise"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prediction Results */}
        {prediction && (
          <div className="space-y-6">
            {/* Risk Level Card */}
            <Card className={`border-2 ${
              prediction.riskLevel === "high" ? "border-destructive/50 bg-destructive/5" :
              prediction.riskLevel === "medium" ? "border-yellow-500/50 bg-yellow-50" :
              "border-green-500/50 bg-green-50"
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${
                    prediction.riskLevel === "high" ? "text-destructive" :
                    prediction.riskLevel === "medium" ? "text-yellow-600" :
                    "text-green-600"
                  }`} />
                  Nível de Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className={`text-4xl font-bold mb-2 ${
                    prediction.riskLevel === "high" ? "text-destructive" :
                    prediction.riskLevel === "medium" ? "text-yellow-600" :
                    "text-green-600"
                  }`}>
                    {prediction.riskLevel === "high" ? "ALTO" :
                     prediction.riskLevel === "medium" ? "MÉDIO" :
                     "BAIXO"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Baseado em {prediction.dataPoints} pontos de dados analisados
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Risk Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Descrição do Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {prediction.riskDescription}
                </p>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recomendações</CardTitle>
                <CardDescription>
                  Ações sugeridas para mitigar riscos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">
                    {prediction.recommendations}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Last Analysis Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações da Análise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data da Análise:</span>
                    <span className="font-medium">
                      {new Date(prediction.analysisDate).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pontos de Dados:</span>
                    <span className="font-medium">{prediction.dataPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Período Analisado:</span>
                    <span className="font-medium">Últimos 30 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTankId && !prediction && (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma análise disponível</CardTitle>
              <CardDescription>
                Execute uma análise para obter insights sobre o tanque selecionado
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}

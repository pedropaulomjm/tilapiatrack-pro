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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function WebhookManagement() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [selectedTankId, setSelectedTankId] = useState<number | null>(null);
  const [tokenName, setTokenName] = useState("");

  const { data: tanks } = trpc.tanks.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: tokens, refetch: refetchTokens } = trpc.webhookTokens.getByTank.useQuery(
    { tankId: selectedTankId! },
    { enabled: !!selectedTankId && isAuthenticated }
  );

  const createTokenMutation = trpc.webhookTokens.create.useMutation({
    onSuccess: () => {
      toast.success("Token criado com sucesso!");
      setTokenName("");
      refetchTokens();
    },
    onError: (error) => {
      toast.error(`Erro ao criar token: ${error.message}`);
    },
  });

  const handleCreateToken = () => {
    if (!selectedTankId) {
      toast.error("Selecione um tanque");
      return;
    }

    createTokenMutation.mutate({
      tankId: selectedTankId,
      name: tokenName || undefined,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
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
              Faça login para gerenciar webhooks.
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Webhooks de Sensores</h1>
          <p className="text-muted-foreground">Gerencie tokens para integração com sensores IoT</p>
        </div>

        {/* Tank Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecionar Tanque</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Create Token */}
        {selectedTankId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Criar Novo Token</CardTitle>
              <CardDescription>
                Gere um novo token para autenticar requisições de sensores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tokenName">Nome do Token (opcional)</Label>
                  <Input
                    id="tokenName"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="Ex: Sensor 1 - Setor Norte"
                  />
                </div>
                <Button
                  onClick={handleCreateToken}
                  disabled={createTokenMutation.isPending}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createTokenMutation.isPending ? "Criando..." : "Criar Token"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tokens List */}
        {selectedTankId && tokens && tokens.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tokens Ativos</CardTitle>
              <CardDescription>
                {tokens.length} token(s) configurado(s) para este tanque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tokens.map(token => (
                  <div key={token.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{token.name || "Token sem nome"}</h3>
                        <p className="text-sm text-muted-foreground">
                          Criado em {new Date(token.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        token.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {token.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <div className="bg-muted p-3 rounded font-mono text-sm break-all mb-3">
                      {token.token}
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium text-foreground">Instruções de uso:</p>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`curl -X POST https://seu-dominio.com/api/webhooks/sensors \\
  -H "Authorization: Bearer ${token.token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "pH": 7.2,
    "temperature": 28.5,
    "dissolvedOxygen": 6.8,
    "ammonia": 0.3
  }'`}
                      </pre>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(token.token)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar Token
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {token.lastUsedAt && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Último uso: {new Date(token.lastUsedAt).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTankId && (!tokens || tokens.length === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Nenhum token criado</CardTitle>
              <CardDescription>
                Crie um token acima para começar a receber dados de sensores
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Documentation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Documentação da API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Endpoint</h3>
              <p className="text-sm text-muted-foreground">
                <code className="bg-muted px-2 py-1 rounded">POST /api/webhooks/sensors</code>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Autenticação</h3>
              <p className="text-sm text-muted-foreground">
                Use o header <code className="bg-muted px-2 py-1 rounded">Authorization: Bearer &lt;token&gt;</code>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Parâmetros (JSON)</h3>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "pH": 7.2,                    // opcional
  "temperature": 28.5,          // opcional (°C)
  "dissolvedOxygen": 6.8,       // opcional (mg/L)
  "ammonia": 0.3                // opcional (mg/L)
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Resposta</h3>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "tankId": 1
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

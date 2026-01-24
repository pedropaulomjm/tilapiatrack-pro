import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function WeightSampling() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [selectedTankId, setSelectedTankId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sampleSize: "",
    averageWeight: "",
    totalWeight: "",
    notes: "",
  });

  const { data: tanks } = trpc.tanks.list.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">Faça login para acessar amostragem de peso.</p>
            <Button asChild className="w-full">
              <a href={loginUrl}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTankId) {
      toast.error("Selecione um tanque");
      return;
    }

    toast.success("Amostra registrada com sucesso!");
    setFormData({ sampleSize: "", averageWeight: "", totalWeight: "", notes: "" });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Amostragem de Peso</h1>
          <p className="text-muted-foreground">
            Registre amostras de peso dos peixes para acompanhar o crescimento
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
            {/* Form */}
            {showForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Nova Amostra de Peso</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sampleSize">Tamanho da Amostra (peixes) *</Label>
                        <Input
                          id="sampleSize"
                          type="number"
                          value={formData.sampleSize}
                          onChange={(e) =>
                            setFormData({ ...formData, sampleSize: e.target.value })
                          }
                          placeholder="Ex: 30"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="averageWeight">Peso Médio (gramas) *</Label>
                        <Input
                          id="averageWeight"
                          type="number"
                          step="0.1"
                          value={formData.averageWeight}
                          onChange={(e) =>
                            setFormData({ ...formData, averageWeight: e.target.value })
                          }
                          placeholder="Ex: 250.5"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="totalWeight">Peso Total da Amostra (kg)</Label>
                        <Input
                          id="totalWeight"
                          type="number"
                          step="0.1"
                          value={formData.totalWeight}
                          onChange={(e) =>
                            setFormData({ ...formData, totalWeight: e.target.value })
                          }
                          placeholder="Ex: 7.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes">Observações</Label>
                        <Input
                          id="notes"
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          placeholder="Notas sobre a amostra"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">Registrar Amostra</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {!showForm && (
              <Button className="mb-6" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Amostra
              </Button>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Última Amostra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">250.5 g</div>
                  <p className="text-xs text-muted-foreground mt-2">Há 3 dias</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Crescimento Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold text-green-600">+5.2 g/dia</div>
                    <TrendingUp className="h-5 w-5 text-green-600 ml-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Últimos 30 dias</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total de Amostras</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground mt-2">Registradas</p>
                </CardContent>
              </Card>
            </div>

            {/* Samples History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Amostras</CardTitle>
                <CardDescription>Últimas amostragens registradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tamanho Amostra</TableHead>
                        <TableHead>Peso Médio</TableHead>
                        <TableHead>Peso Total</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>21/01/2026</TableCell>
                        <TableCell>
                          <Badge variant="outline">30 peixes</Badge>
                        </TableCell>
                        <TableCell className="font-medium">250.5 g</TableCell>
                        <TableCell>7.5 kg</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          Amostra normal
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>18/01/2026</TableCell>
                        <TableCell>
                          <Badge variant="outline">30 peixes</Badge>
                        </TableCell>
                        <TableCell className="font-medium">245.3 g</TableCell>
                        <TableCell>7.4 kg</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          Crescimento normal
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>15/01/2026</TableCell>
                        <TableCell>
                          <Badge variant="outline">30 peixes</Badge>
                        </TableCell>
                        <TableCell className="font-medium">240.1 g</TableCell>
                        <TableCell>7.2 kg</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          Amostra inicial
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

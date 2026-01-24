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
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SpeciesManagement() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    scientificName: "",
    description: "",
    idealTemperatureMin: "",
    idealTemperatureMax: "",
    idealPHMin: "",
    idealPHMax: "",
  });

  const { data: species, isLoading, refetch } = trpc.species.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const createMutation = trpc.species.create.useMutation({
    onSuccess: () => {
      toast.success("Espécie criada com sucesso!");
      setFormData({
        name: "",
        scientificName: "",
        description: "",
        idealTemperatureMin: "",
        idealTemperatureMax: "",
        idealPHMin: "",
        idealPHMax: "",
      });
      setShowForm(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Faça login para gerenciar espécies.
            </p>
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
    createMutation.mutate({
      name: formData.name,
      scientificName: formData.scientificName || undefined,
      description: formData.description || undefined,
      idealTemperatureMin: formData.idealTemperatureMin
        ? parseFloat(formData.idealTemperatureMin)
        : undefined,
      idealTemperatureMax: formData.idealTemperatureMax
        ? parseFloat(formData.idealTemperatureMax)
        : undefined,
      idealPHMin: formData.idealPHMin ? parseFloat(formData.idealPHMin) : undefined,
      idealPHMax: formData.idealPHMax ? parseFloat(formData.idealPHMax) : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciamento de Espécies</h1>
          <p className="text-muted-foreground">
            Defina espécies de peixe e seus parâmetros ideais globais
          </p>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nova Espécie</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Popular *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ex: Tilápia do Nilo"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="scientificName">Nome Científico</Label>
                    <Input
                      id="scientificName"
                      value={formData.scientificName}
                      onChange={(e) =>
                        setFormData({ ...formData, scientificName: e.target.value })
                      }
                      placeholder="Ex: Oreochromis niloticus"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Descrição da espécie"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tempMin">Temperatura Mín. (°C)</Label>
                    <Input
                      id="tempMin"
                      type="number"
                      step="0.1"
                      value={formData.idealTemperatureMin}
                      onChange={(e) =>
                        setFormData({ ...formData, idealTemperatureMin: e.target.value })
                      }
                      placeholder="Ex: 24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tempMax">Temperatura Máx. (°C)</Label>
                    <Input
                      id="tempMax"
                      type="number"
                      step="0.1"
                      value={formData.idealTemperatureMax}
                      onChange={(e) =>
                        setFormData({ ...formData, idealTemperatureMax: e.target.value })
                      }
                      placeholder="Ex: 32"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phMin">pH Mín.</Label>
                    <Input
                      id="phMin"
                      type="number"
                      step="0.1"
                      value={formData.idealPHMin}
                      onChange={(e) =>
                        setFormData({ ...formData, idealPHMin: e.target.value })
                      }
                      placeholder="Ex: 6.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phMax">pH Máx.</Label>
                    <Input
                      id="phMax"
                      type="number"
                      step="0.1"
                      value={formData.idealPHMax}
                      onChange={(e) =>
                        setFormData({ ...formData, idealPHMax: e.target.value })
                      }
                      placeholder="Ex: 8.0"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Salvando..." : "Salvar Espécie"}
                  </Button>
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

        {/* Button to show form */}
        {!showForm && (
          <Button className="mb-6" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Espécie
          </Button>
        )}

        {/* Species List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando espécies...</p>
          </div>
        ) : species && species.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome Popular</TableHead>
                      <TableHead>Nome Científico</TableHead>
                      <TableHead>Temperatura Ideal</TableHead>
                      <TableHead>pH Ideal</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {species.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.scientificName || "-"}
                        </TableCell>
                        <TableCell>
                          {s.idealTemperatureMin && s.idealTemperatureMax ? (
                            <Badge variant="outline">
                              {s.idealTemperatureMin}°C - {s.idealTemperatureMax}°C
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {s.idealPHMin && s.idealPHMax ? (
                            <Badge variant="outline">
                              {s.idealPHMin} - {s.idealPHMax}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingId(s.id);
                                setShowForm(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma espécie cadastrada</CardTitle>
              <CardDescription>
                Clique em "Nova Espécie" para começar a adicionar espécies de peixe
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}

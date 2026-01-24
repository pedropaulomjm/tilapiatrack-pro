import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { DeleteButton } from "@/components/DeleteButton";

export default function TankManagement() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    volume: "",
    location: "",
  });

  const { data: tanks, isLoading } = trpc.tanks.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.tanks.create.useMutation({
    onSuccess: () => {
      toast.success("Tanque criado com sucesso!");
      setFormData({ name: "", description: "", volume: "", location: "" });
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar tanque: ${error.message}`);
    },
  });

  const deleteMutation = trpc.tanks.delete.useMutation({
    onSuccess: () => {
      toast.success("Tanque deletado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao deletar tanque: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nome do tanque é obrigatório");
      return;
    }
    createMutation.mutate(formData);
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
              Faça login para gerenciar seus tanques.
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciar Tanques</h1>
          <p className="text-muted-foreground">Crie e configure seus tanques de piscicultura</p>
        </div>

        {/* Create Tank Form */}
        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Novo Tanque</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Tanque *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Tanque 1 - Setor Norte"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do tanque..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="volume">Volume (litros)</Label>
                    <Input
                      id="volume"
                      type="number"
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                      placeholder="Ex: 5000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: Setor Norte"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Criando..." : "Criar Tanque"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setFormData({ name: "", description: "", volume: "", location: "" });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Create Button */}
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="mb-6">
            <Plus className="mr-2 h-4 w-4" />
            Novo Tanque
          </Button>
        )}

        {/* Tanks List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando tanques...</p>
          </div>
        ) : tanks && tanks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tanks.map(tank => (
              <Card key={tank.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{tank.name}</CardTitle>
                      <CardDescription>{tank.location}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      tank.status === "active" ? "bg-green-100 text-green-800" :
                      tank.status === "inactive" ? "bg-gray-100 text-gray-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {tank.status === "active" ? "Ativo" : tank.status === "inactive" ? "Inativo" : "Manutenção"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {tank.description && (
                    <p className="text-sm text-muted-foreground mb-3">{tank.description}</p>
                  )}
                  {tank.volume && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Volume: {tank.volume} litros
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/tanks/${tank.id}/settings`}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Configurar
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/tanks/${tank.id}`}>
                        Ver Dashboard
                      </Link>
                    </Button>
                    <DeleteButton
                      itemName={tank.name}
                      itemType="Tanque"
                      onConfirm={async () => {
                        await new Promise((resolve, reject) => {
                          deleteMutation.mutate({ id: tank.id }, {
                            onSuccess: resolve,
                            onError: reject,
                          });
                        });
                      }}
                      disabled={deleteMutation.isPending}
                      size="icon"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Nenhum tanque cadastrado</CardTitle>
              <CardDescription>
                Crie seu primeiro tanque para começar o monitoramento
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}

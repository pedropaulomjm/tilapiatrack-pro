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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Plus, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function FeedingControl() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [selectedTankId, setSelectedTankId] = useState<number | null>(null);
  const [time, setTime] = useState("08:00");
  const [quantity, setQuantity] = useState("");

  const { data: tanks } = trpc.tanks.list.useQuery(undefined, {
    enabled: isAuthenticated,
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
              Faça login para acessar o controle de alimentação.
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Controle de Alimentação</h1>
          <p className="text-muted-foreground">Gerencie alimentadores automáticos e programações</p>
        </div>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList>
            <TabsTrigger value="schedule">Programações</TabsTrigger>
            <TabsTrigger value="records">Histórico</TabsTrigger>
            <TabsTrigger value="feeders">Alimentadores</TabsTrigger>
          </TabsList>

          {/* Programações */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
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

            {selectedTankId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Criar Programação
                  </CardTitle>
                  <CardDescription>
                    Configure horários e quantidades de ração para alimentadores automáticos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="time">Horário</Label>
                        <Input
                          id="time"
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantidade (kg)</Label>
                        <Input
                          id="quantity"
                          type="number"
                          step="0.1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="Ex: 5.5"
                        />
                      </div>
                    </div>
                    <Button className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Adicionar Programação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTankId && (
              <Card>
                <CardHeader>
                  <CardTitle>Programações Ativas</CardTitle>
                  <CardDescription>
                    Horários configurados para este tanque
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-foreground">08:00 - 5.5 kg</p>
                          <p className="text-sm text-muted-foreground">Alimentador 1</p>
                        </div>
                        <Button variant="destructive" size="sm">
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Consumo de Ração
                </CardTitle>
                <CardDescription>
                  Últimos 7 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { date: "Seg", planejado: 5.5, real: 5.3 },
                    { date: "Ter", planejado: 5.5, real: 5.5 },
                    { date: "Qua", planejado: 5.5, real: 5.2 },
                    { date: "Qui", planejado: 5.5, real: 5.6 },
                    { date: "Sex", planejado: 5.5, real: 5.4 },
                    { date: "Sab", planejado: 5.5, real: 5.5 },
                    { date: "Dom", planejado: 5.5, real: 5.3 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="planejado" stroke="#3b82f6" name="Planejado (kg)" />
                    <Line type="monotone" dataKey="real" stroke="#10b981" name="Real (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Planejado</p>
                    <p className="text-2xl font-bold text-foreground">38.5 kg</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Real</p>
                    <p className="text-2xl font-bold text-foreground">37.8 kg</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Variação</p>
                    <p className="text-2xl font-bold text-foreground">-1.8%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alimentadores */}
          <TabsContent value="feeders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alimentadores Disponíveis</CardTitle>
                <CardDescription>
                  Dispositivos cadastrados no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground">Alimentador 1</h3>
                        <p className="text-sm text-muted-foreground">Modelo: AF-2000</p>
                        <p className="text-sm text-muted-foreground">Tanque: Test Tank</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        Ativo
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

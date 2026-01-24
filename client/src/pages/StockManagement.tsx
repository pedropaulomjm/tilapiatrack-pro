import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Plus, Package, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function StockManagement() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [itemName, setItemName] = useState("");
  const [itemUnit, setItemUnit] = useState("kg");
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Faça login para acessar o estoque.
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Estoque</h1>
          <p className="text-muted-foreground">Controle de itens, movimentações e fornecedores</p>
        </div>

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList>
            <TabsTrigger value="items">Itens</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          {/* Itens de Estoque */}
          <TabsContent value="items" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar Item
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemName">Nome do Item</Label>
                      <Input
                        id="itemName"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Ex: Ração Premium"
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemUnit">Unidade</Label>
                      <Input
                        id="itemUnit"
                        value={itemUnit}
                        onChange={(e) => setItemUnit(e.target.value)}
                        placeholder="Ex: kg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minQuantity">Quantidade Mínima</Label>
                      <Input
                        id="minQuantity"
                        type="number"
                        value={minQuantity}
                        onChange={(e) => setMinQuantity(e.target.value)}
                        placeholder="Ponto de pedido"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxQuantity">Quantidade Máxima</Label>
                      <Input
                        id="maxQuantity"
                        type="number"
                        value={maxQuantity}
                        onChange={(e) => setMaxQuantity(e.target.value)}
                        placeholder="Capacidade máxima"
                      />
                    </div>
                  </div>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Item
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Itens em Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Mín./Máx.</TableHead>
                        <TableHead>Último Custo</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Ração Premium 45%</TableCell>
                        <TableCell>250</TableCell>
                        <TableCell>kg</TableCell>
                        <TableCell>100/500</TableCell>
                        <TableCell>R$ 2.50</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            OK
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Medicamento A</TableCell>
                        <TableCell>15</TableCell>
                        <TableCell>litro</TableCell>
                        <TableCell>10/50</TableCell>
                        <TableCell>R$ 45.00</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            Baixo
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Movimentações */}
          <TabsContent value="movements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Movimentação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo</Label>
                      <select className="w-full border border-border rounded-md p-2 bg-background">
                        <option>Entrada</option>
                        <option>Saída</option>
                        <option>Ajuste</option>
                      </select>
                    </div>
                    <div>
                      <Label>Item</Label>
                      <select className="w-full border border-border rounded-md p-2 bg-background">
                        <option>Ração Premium 45%</option>
                        <option>Medicamento A</option>
                      </select>
                    </div>
                    <div>
                      <Label>Quantidade</Label>
                      <Input type="number" placeholder="100" />
                    </div>
                    <div>
                      <Label>Custo Unitário</Label>
                      <Input type="number" placeholder="2.50" step="0.01" />
                    </div>
                  </div>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Movimentação
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Movimentações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Custo Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>24/01/2026</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            Entrada
                          </span>
                        </TableCell>
                        <TableCell>Ração Premium 45%</TableCell>
                        <TableCell>100 kg</TableCell>
                        <TableCell>R$ 250.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alertas */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="border-yellow-500/50 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <AlertTriangle className="h-5 w-5" />
                  Itens com Estoque Baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border border-yellow-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-yellow-900">Medicamento A</p>
                        <p className="text-sm text-yellow-800">Estoque: 15 litros | Mínimo: 10 litros</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Solicitar Compra
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Análise de Consumo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Ração Premium 45%</p>
                    <p className="text-sm text-muted-foreground">
                      Consumo médio: 50 kg/dia | Dias restantes: 5 dias
                    </p>
                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "50%" }}></div>
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

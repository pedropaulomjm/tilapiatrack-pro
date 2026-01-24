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
import { Download, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const { isAuthenticated, loginUrl } = useAuth();
  const [selectedTankId, setSelectedTankId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: tanks } = trpc.tanks.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: historicalData, isLoading } = trpc.waterQuality.getRange.useQuery(
    {
      tankId: selectedTankId!,
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date(),
    },
    { enabled: !!selectedTankId && isAuthenticated }
  );

  const handleExportCSV = () => {
    if (!historicalData || historicalData.length === 0) {
      toast.error("Nenhum dado disponível para exportar");
      return;
    }

    const headers = ["Data/Hora", "pH", "Temperatura (°C)", "Oxigênio Dissolvido (mg/L)", "Amônia (mg/L)"];
    const rows = historicalData.map(d => [
      new Date(d.timestamp).toLocaleString("pt-BR"),
      d.pH || "-",
      d.temperature || "-",
      d.dissolvedOxygen || "-",
      d.ammonia || "-",
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${selectedTankId}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Relatório exportado com sucesso!");
  };

  const calculateStats = () => {
    if (!historicalData || historicalData.length === 0) return null;

    const validPH = historicalData.map(d => d.pH).filter(Boolean).map(Number);
    const validTemp = historicalData.map(d => d.temperature).filter(Boolean).map(Number);
    const validOD = historicalData.map(d => d.dissolvedOxygen).filter(Boolean).map(Number);
    const validAmmonia = historicalData.map(d => d.ammonia).filter(Boolean).map(Number);

    const avg = (arr: number[]) => arr.length > 0 ? (arr.reduce((a, b) => a + b) / arr.length).toFixed(2) : "-";
    const min = (arr: number[]) => arr.length > 0 ? Math.min(...arr).toFixed(2) : "-";
    const max = (arr: number[]) => arr.length > 0 ? Math.max(...arr).toFixed(2) : "-";

    return {
      pH: { avg: avg(validPH), min: min(validPH), max: max(validPH) },
      temperature: { avg: avg(validTemp), min: min(validTemp), max: max(validTemp) },
      dissolvedOxygen: { avg: avg(validOD), min: min(validOD), max: max(validOD) },
      ammonia: { avg: avg(validAmmonia), min: min(validAmmonia), max: max(validAmmonia) },
    };
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
              Faça login para acessar os relatórios.
            </p>
            <Button asChild className="w-full">
              <a href={loginUrl}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios</h1>
          <p className="text-muted-foreground">Analise dados históricos e exporte relatórios</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="tank">Tanque</Label>
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

              <div>
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleExportCSV} disabled={!selectedTankId || isLoading} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">pH</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Média</p>
                    <p className="text-2xl font-bold">{stats.pH.avg}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Mín</p>
                      <p className="font-semibold">{stats.pH.min}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Máx</p>
                      <p className="font-semibold">{stats.pH.max}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Temperatura (°C)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Média</p>
                    <p className="text-2xl font-bold">{stats.temperature.avg}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Mín</p>
                      <p className="font-semibold">{stats.temperature.min}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Máx</p>
                      <p className="font-semibold">{stats.temperature.max}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">O.D. (mg/L)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Média</p>
                    <p className="text-2xl font-bold">{stats.dissolvedOxygen.avg}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Mín</p>
                      <p className="font-semibold">{stats.dissolvedOxygen.min}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Máx</p>
                      <p className="font-semibold">{stats.dissolvedOxygen.max}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Amônia (mg/L)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Média</p>
                    <p className="text-2xl font-bold">{stats.ammonia.avg}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Mín</p>
                      <p className="font-semibold">{stats.ammonia.min}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Máx</p>
                      <p className="font-semibold">{stats.ammonia.max}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Table */}
        {historicalData && historicalData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dados Históricos</CardTitle>
              <CardDescription>
                {historicalData.length} registros encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Data/Hora</th>
                      <th className="text-left py-2 px-4">pH</th>
                      <th className="text-left py-2 px-4">Temperatura (°C)</th>
                      <th className="text-left py-2 px-4">O.D. (mg/L)</th>
                      <th className="text-left py-2 px-4">Amônia (mg/L)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.slice(-50).reverse().map((data, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">{new Date(data.timestamp).toLocaleString("pt-BR")}</td>
                        <td className="py-2 px-4">{data.pH ? Number(data.pH).toFixed(2) : "-"}</td>
                        <td className="py-2 px-4">{data.temperature ? Number(data.temperature).toFixed(2) : "-"}</td>
                        <td className="py-2 px-4">{data.dissolvedOxygen ? Number(data.dissolvedOxygen).toFixed(2) : "-"}</td>
                        <td className="py-2 px-4">{data.ammonia ? Number(data.ammonia).toFixed(2) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

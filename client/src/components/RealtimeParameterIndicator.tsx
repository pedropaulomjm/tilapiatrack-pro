import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Wifi, WifiOff } from "lucide-react";
import type { WaterQualityData } from "../../../drizzle/schema";

interface RealtimeParameterIndicatorProps {
  tankId: number;
  parameter: "pH" | "temperature" | "dissolvedOxygen" | "ammonia";
  label: string;
  unit: string;
  minSafe?: number;
  maxSafe?: number;
  minCritical?: number;
  maxCritical?: number;
  currentValue?: number;
}

export function RealtimeParameterIndicator({
  tankId,
  parameter,
  label,
  unit,
  minSafe = 0,
  maxSafe = 10,
  minCritical = 0,
  maxCritical = 10,
  currentValue,
}: RealtimeParameterIndicatorProps) {
  const { isConnected, latestWaterQuality } = useWebSocket({ tankId, enabled: true });
  const [displayValue, setDisplayValue] = useState<number | string>(currentValue ?? "--");
  const [status, setStatus] = useState<"normal" | "warning" | "critical">("normal");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Atualizar quando receber dados do WebSocket
  useEffect(() => {
    if (latestWaterQuality && latestWaterQuality.tankId === tankId) {
      const value = latestWaterQuality[parameter as keyof WaterQualityData] as number | undefined;
      if (value !== undefined) {
        setDisplayValue(parseFloat(value.toString()).toFixed(2));
        setLastUpdated(new Date());

        // Determinar status
        if (value < minCritical || value > maxCritical) {
          setStatus("critical");
        } else if (value < minSafe || value > maxSafe) {
          setStatus("warning");
        } else {
          setStatus("normal");
        }
      }
    }
  }, [latestWaterQuality, tankId, parameter, minSafe, maxSafe, minCritical, maxCritical]);

  const statusColors = {
    normal: "text-green-600 bg-green-50 border-green-200",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
    critical: "text-red-600 bg-red-50 border-red-200",
  };

  const statusIcons = {
    normal: <CheckCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    critical: <AlertCircle className="h-4 w-4" />,
  };

  const statusLabels = {
    normal: "Normal",
    warning: "Aviso",
    critical: "Crítico",
  };

  return (
    <Card className={`border ${statusColors[status]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-400" />
            )}
            <Badge variant="outline" className="text-xs">
              {statusLabels[status]}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          {minSafe.toFixed(1)} - {maxSafe.toFixed(1)} {unit}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <div className="text-3xl font-bold">{displayValue}</div>
          <div className="text-sm text-muted-foreground mb-1">{unit}</div>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-2">
            Atualizado: {lastUpdated.toLocaleTimeString("pt-BR")}
          </p>
        )}
        {isConnected && (
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
            <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse" />
            Tempo real
          </div>
        )}
      </CardContent>
    </Card>
  );
}

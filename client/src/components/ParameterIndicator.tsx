import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { INDICATOR_COLORS } from "@shared/constants";

interface ParameterIndicatorProps {
  label: string;
  value: number | null | undefined;
  unit: string;
  minSafe?: number;
  maxSafe?: number;
  minCritical?: number;
  maxCritical?: number;
}

export function ParameterIndicator({
  label,
  value,
  unit,
  minSafe,
  maxSafe,
  minCritical,
  maxCritical,
}: ParameterIndicatorProps) {
  if (value === null || value === undefined) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">--</p>
          </div>
          <div className="text-muted-foreground">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>
    );
  }

  let status: "optimal" | "warning" | "critical" = "optimal";
  let icon = <CheckCircle size={24} />;

  if (minCritical !== undefined && value < minCritical) {
    status = "critical";
    icon = <AlertTriangle size={24} />;
  } else if (maxCritical !== undefined && value > maxCritical) {
    status = "critical";
    icon = <AlertTriangle size={24} />;
  } else if (minSafe !== undefined && value < minSafe) {
    status = "warning";
    icon = <AlertCircle size={24} />;
  } else if (maxSafe !== undefined && value > maxSafe) {
    status = "warning";
    icon = <AlertCircle size={24} />;
  }

  const statusColor =
    status === "critical"
      ? INDICATOR_COLORS.critical
      : status === "warning"
        ? INDICATOR_COLORS.warning
        : INDICATOR_COLORS.optimal;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">
            {value.toFixed(2)} <span className="text-lg">{unit}</span>
          </p>
          {minSafe !== undefined && maxSafe !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              Seguro: {minSafe} - {maxSafe} {unit}
            </p>
          )}
        </div>
        <div style={{ color: statusColor }}>{icon}</div>
      </div>
    </div>
  );
}

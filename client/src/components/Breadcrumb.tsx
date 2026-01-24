import { useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BreadcrumbItem {
  label: string;
  path?: string;
  action?: () => void;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const [, navigate] = useLocation();

  const handleNavigate = (item: BreadcrumbItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="flex items-center gap-1 mb-6 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="gap-1"
      >
        <Home className="h-4 w-4" />
        Início
      </Button>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />

          {index === items.length - 1 ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate(item)}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

import { ReactNode } from "react";
import { ModuleSelector } from "./ModuleSelector";
import { Navigation } from "./Navigation";
import { NotificationCenter } from "./NotificationCenter";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar com Seletor de Módulos */}
      <ModuleSelector />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-background">
          <div className="flex items-center justify-between h-16 px-6">
            <h1 className="text-2xl font-bold text-foreground">TilapiaTrack Pro</h1>
            <div className="flex items-center gap-4">
              <NotificationCenter />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

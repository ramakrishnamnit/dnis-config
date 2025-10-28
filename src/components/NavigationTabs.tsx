import { Home, Music, History } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const NavigationTabs = () => {
  const location = useLocation();
  
  const tabs = [
    { path: "/", label: "Config", icon: Home },
    { path: "/audio", label: "Audio", icon: Music },
    { path: "/audit", label: "Audit", icon: History },
  ];
  
  return (
    <div className="glass-strong border-b border-border shadow-sm">
      <div className="container mx-auto px-6">
        <nav className="flex items-center gap-8" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <Link
                key={tab.path}
                to={tab.path}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  "flex items-center gap-2 px-1 py-4 text-sm font-medium transition-all relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary shadow-[0_2px_8px_rgba(220,38,38,0.4)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};


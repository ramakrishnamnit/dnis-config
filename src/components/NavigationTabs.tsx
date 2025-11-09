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
    <div className="glass-strong border-b border-border">
      <div className="container mx-auto px-4">
        <nav className="flex items-center gap-6" role="tablist">
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
                  "flex items-center gap-2 px-1 py-3 text-xs font-medium transition-all relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};


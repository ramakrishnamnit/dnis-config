import { User, LogOut, Shield, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
}

export const Header = ({ theme, onThemeChange }: HeaderProps) => {
  return (
    <header className="glass sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center glow-red">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Configuration Data Management</h1>
                <p className="text-xs text-muted-foreground">HSBC Enterprise Portal</p>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
              variant="outline"
              size="icon"
              className="glass-hover border-primary/30 text-foreground hover:text-primary hover:glow-red"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Session Secure Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 glass rounded-lg border border-status-success/30">
              <div className="w-2 h-2 bg-status-success rounded-full animate-glow-pulse" />
              <span className="text-xs text-status-success font-medium">Session Secure</span>
            </div>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="glass-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-medium text-foreground">John Doe</p>
                      <Badge variant="outline" className="text-xs border-primary/30">
                        Admin
                      </Badge>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass border-border">
                <DropdownMenuLabel className="text-foreground">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="text-foreground hover:bg-card-hover">
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-foreground hover:bg-card-hover">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="text-destructive hover:bg-destructive/10">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

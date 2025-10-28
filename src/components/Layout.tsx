import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { NavigationTabs } from "@/components/NavigationTabs";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme === "light" || savedTheme === "dark") ? savedTheme : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header theme={theme} onThemeChange={setTheme} />
      <NavigationTabs />
      <main className="flex-1 overflow-hidden bg-background">
        <div className="h-full flex flex-col container mx-auto px-6 py-6">
          <div className="glass-strong rounded-xl shadow-lg p-6 flex-1 overflow-hidden flex flex-col">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};


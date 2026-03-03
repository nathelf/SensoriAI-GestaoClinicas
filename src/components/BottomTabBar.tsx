import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Plus, Users } from "lucide-react";
import { SensoriAILogo } from "@/components/SensoriAILogo";

const tabs = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: Plus, label: "Novo", path: "/novo-atendimento", isCenter: true },
  { icon: Users, label: "Clientes", path: "/pacientes" },
  { icon: Home, label: "IA", path: "/sensori/chat", useLogo: true },
];

export function BottomTabBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/40 lg:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          if (tab.isCenter) {
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-[10px] mt-0.5 font-medium text-primary-foreground/80">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center py-2"
            >
              {"useLogo" in tab && tab.useLogo ? (
                <div className={isActive ? "text-primary" : "text-muted-foreground"}>
                  <SensoriAILogo variant="icon" iconClassName="w-5 h-5" noTextFallback />
                </div>
              ) : (
                <Icon
                  className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
              )}
              <span
                className={`text-[10px] mt-0.5 transition-colors ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

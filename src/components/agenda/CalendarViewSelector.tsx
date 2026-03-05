import { LayoutGrid, List, AlignJustify } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarViewSelectorProps {
  value: "default" | "compact" | "timeline";
  onChange: (v: "default" | "compact" | "timeline") => void;
}

const views = [
  { key: "default" as const, icon: LayoutGrid, label: "Padrão" },
  { key: "compact" as const, icon: AlignJustify, label: "Compacto" },
  { key: "timeline" as const, icon: List, label: "Timeline" },
];

const CalendarViewSelector = ({ value, onChange }: CalendarViewSelectorProps) => (
  <div className="flex items-center gap-0.5 bg-muted rounded-lg p-1">
    {views.map(v => (
      <Button
        key={v.key}
        variant="ghost"
        size="sm"
        onClick={() => onChange(v.key)}
        className={`h-7 px-2.5 gap-1.5 text-xs rounded-md transition-all ${
          value === v.key
            ? "bg-card shadow-card text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <v.icon className="h-3.5 w-3.5" />
        {v.label}
      </Button>
    ))}
  </div>
);

export default CalendarViewSelector;

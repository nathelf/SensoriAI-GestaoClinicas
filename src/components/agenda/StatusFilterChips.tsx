import { STATUS_CONFIG, type AppointmentStatus } from "./AppointmentCard";

interface StatusFilterChipsProps {
  selected: AppointmentStatus[];
  onChange: (statuses: AppointmentStatus[]) => void;
}

const StatusFilterChips = ({ selected, onChange }: StatusFilterChipsProps) => {
  const toggle = (status: AppointmentStatus) => {
    if (selected.includes(status)) {
      onChange(selected.filter(s => s !== status));
    } else {
      onChange([...selected, status]);
    }
  };

  const allSelected = selected.length === 0;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange([])}
        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
          allSelected
            ? "bg-primary/10 text-primary border-primary/30"
            : "bg-card text-muted-foreground border-border hover:bg-muted"
        }`}
      >
        Todos
      </button>
      {(Object.entries(STATUS_CONFIG) as [AppointmentStatus, typeof STATUS_CONFIG[AppointmentStatus]][]).map(([key, config]) => {
        const isActive = selected.includes(key);
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border flex items-center gap-1.5 ${
              isActive
                ? config.className
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
            {config.label}
          </button>
        );
      })}
    </div>
  );
};

export default StatusFilterChips;

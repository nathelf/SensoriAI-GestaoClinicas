import * as React from "react";
import {
  Clock,
  Video,
  MapPin,
  Stethoscope,
  Check,
  X,
  CalendarClock,
  UserCheck,
  Play,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type AppointmentStatus =
  | "agendado"
  | "confirmado"
  | "faltou"
  | "cancelado"
  | "concluido";

export type AppointmentModality = "presencial" | "teleconsulta" | "procedimento";

export interface Appointment {
  id: string;
  patient: string;
  type: string;
  duration: string;
  status: AppointmentStatus;
  day: number;
  startSlot: number;
  slots: number;
  modality?: AppointmentModality;
}

export const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; className: string; dotClass: string }
> = {
  agendado: {
    label: "Agendado",
    className:
      "bg-status-scheduled/10 border-status-scheduled/30 text-status-scheduled",
    dotClass: "bg-status-scheduled",
  },
  confirmado: {
    label: "Confirmado",
    className:
      "bg-status-confirmed/10 border-status-confirmed/30 text-status-confirmed",
    dotClass: "bg-status-confirmed",
  },
  faltou: {
    label: "Faltou",
    className:
      "bg-status-noshow/10 border-status-noshow/30 text-status-noshow",
    dotClass: "bg-status-noshow",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-muted border-border text-muted-foreground",
    dotClass: "bg-status-cancelled",
  },
  concluido: {
    label: "Concluído",
    className:
      "bg-status-confirmed/10 border-status-confirmed/30 text-status-confirmed",
    dotClass: "bg-status-confirmed",
  },
};

export const HOURS = Array.from({ length: 25 }, (_, i) => {
  const h = 7 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${h.toString().padStart(2, "0")}:${m}`;
}).slice(0, 25);

const MODALITY_ICONS: Record<AppointmentModality, React.ReactNode> = {
  teleconsulta: <Video className="h-3 w-3" />,
  presencial: <MapPin className="h-3 w-3" />,
  procedimento: <Stethoscope className="h-3 w-3" />,
};

function getInitials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  destructive?: boolean;
}

const QuickAction = ({ icon, label, onClick, destructive }: QuickActionProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
        className={[
          "w-6 h-6 rounded-md flex items-center justify-center transition-colors",
          "text-muted-foreground bg-card/80 shadow-sm border border-border/50",
          destructive
            ? "hover:bg-destructive/10 hover:text-destructive"
            : "hover:bg-primary-light hover:text-primary",
        ].join(" ")}
        aria-label={label}
        title={label}
      >
        {icon}
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="text-xs">
      {label}
    </TooltipContent>
  </Tooltip>
);

interface AppointmentCardProps {
  appointment: Appointment;
  slotHeight: number;
  onClick: () => void;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
}

const AppointmentCard = ({
  appointment: apt,
  slotHeight,
  onClick,
  onStatusChange,
}: AppointmentCardProps) => {
  // ✅ airbag: nunca quebra se vier status inesperado
  const config =
    STATUS_CONFIG[apt.status] ?? STATUS_CONFIG["agendado"];

  const startTime = HOURS[apt.startSlot] ?? HOURS[0] ?? "--:--";
  const endSlot = apt.startSlot + apt.slots;
  const lastHour = HOURS[HOURS.length - 1] ?? "--:--";
  const endTime = HOURS[endSlot] ?? lastHour;

  const initials = getInitials(apt.patient);

  return (
    <TooltipProvider delayDuration={200}>
      <button
        type="button"
        onClick={onClick}
        className={[
          "absolute inset-x-1 rounded-lg border px-2 py-1.5 text-left cursor-pointer",
          "transition-all hover:shadow-card-hover z-10 group/card",
          config.className,
        ].join(" ")}
        style={{ height: `${apt.slots * slotHeight - 4}px`, top: "2px" }}
      >
        {/* Quick Actions (aparecem no hover) */}
        <div className="absolute -top-1 right-1 hidden group-hover/card:flex items-center gap-0.5 z-20">
          {/* ✅ confirmar só quando estiver agendado */}
          {apt.status === "agendado" && (
            <QuickAction
              icon={<Check className="h-3 w-3" />}
              label="Confirmar"
              onClick={() => onStatusChange?.(apt.id, "confirmado")}
            />
          )}

          {/* ✅ ações disponíveis em agendado/confirmado */}
          {(apt.status === "agendado" || apt.status === "confirmado") && (
            <>
              <QuickAction
                icon={<UserCheck className="h-3 w-3" />}
                label="Check-in"
                onClick={() => {}}
              />
              <QuickAction
                icon={<Play className="h-3 w-3" />}
                label="Iniciar"
                onClick={() => {}}
              />
              <QuickAction
                icon={<CalendarClock className="h-3 w-3" />}
                label="Reagendar"
                onClick={() => {}}
              />
              <QuickAction
                icon={<X className="h-3 w-3" />}
                label="Cancelar"
                onClick={() => onStatusChange?.(apt.id, "cancelado")}
                destructive
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary">
              {initials}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold truncate flex-1">
                {apt.patient}
              </p>
              {apt.modality && (
                <span className="opacity-60 flex-shrink-0">
                  {MODALITY_ICONS[apt.modality]}
                </span>
              )}
            </div>
            <p className="text-[10px] opacity-70 truncate">{apt.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-1">
          <Clock className="h-3 w-3 opacity-60" />
          <span className="text-[10px] opacity-80">
            {startTime} – {endTime}
          </span>
          <span className="text-[10px] opacity-60 ml-auto">{apt.duration}</span>
        </div>
      </button>
    </TooltipProvider>
  );
};

export default AppointmentCard;
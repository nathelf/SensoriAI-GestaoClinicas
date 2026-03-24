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
  MoreHorizontal,
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
  duration: string; // ex: "30 min"
  status: AppointmentStatus;
  day: number;
  startSlot: number;
  slots: number;
  modality?: AppointmentModality;
}

export const STATUS_CONFIG: Record<
  AppointmentStatus,
  {
    label: string;
    className: string;
    dotClass: string;
    accentClass: string; // barra lateral
  }
> = {
  agendado: {
    label: "Agendado",
    className:
      "bg-status-scheduled/10 border-status-scheduled/30 text-status-scheduled",
    dotClass: "bg-status-scheduled",
    accentClass: "bg-status-scheduled",
  },
  confirmado: {
    label: "Confirmado",
    className:
      "bg-status-confirmed/10 border-status-confirmed/30 text-status-confirmed",
    dotClass: "bg-status-confirmed",
    accentClass: "bg-status-confirmed",
  },
  faltou: {
    label: "Faltou",
    className: "bg-status-noshow/10 border-status-noshow/30 text-status-noshow",
    dotClass: "bg-status-noshow",
    accentClass: "bg-status-noshow",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-muted border-border text-muted-foreground",
    dotClass: "bg-status-cancelled",
    accentClass: "bg-status-cancelled",
  },
  concluido: {
    label: "Concluído",
    className:
      "bg-status-confirmed/10 border-status-confirmed/30 text-status-confirmed",
    dotClass: "bg-status-confirmed",
    accentClass: "bg-status-confirmed",
  },
};

export const HOURS = Array.from({ length: 25 }, (_, i) => {
  const h = 7 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${h.toString().padStart(2, "0")}:${m}`;
}).slice(0, 25);

const MODALITY_ICONS: Record<AppointmentModality, React.ReactNode> = {
  teleconsulta: <Video className="h-3.5 w-3.5" />,
  presencial: <MapPin className="h-3.5 w-3.5" />,
  procedimento: <Stethoscope className="h-3.5 w-3.5" />,
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
          "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
          "bg-background/80 backdrop-blur border border-border/60 shadow-sm",
          destructive
            ? "hover:bg-destructive/10 hover:text-destructive"
            : "hover:bg-primary/10 hover:text-primary",
          "text-muted-foreground",
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
  const config = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG.agendado;

  const startTime = HOURS[apt.startSlot] ?? HOURS[0] ?? "--:--";
  const endSlot = apt.startSlot + apt.slots;
  const lastHour = HOURS[HOURS.length - 1] ?? "--:--";
  const endTime = HOURS[endSlot] ?? lastHour;

  const initials = getInitials(apt.patient);

  // deixa cards curtinhos mais "limpos" (não tenta enfiar tudo em 1 slot)
  const isCompact = apt.slots <= 1;

  return (
    <TooltipProvider delayDuration={150}>
      <button
        type="button"
        onClick={onClick}
        className={[
          "absolute inset-x-1 text-left cursor-pointer z-10 group/card",
          "rounded-xl border shadow-sm transition-all",
          "hover:shadow-md hover:-translate-y-[0.5px]",
          "focus:outline-none focus:ring-2 focus:ring-primary/30",
          config.className,
        ].join(" ")}
        style={{ height: `${apt.slots * slotHeight - 6}px`, top: "3px" }}
      >
        {/* Accent bar (igual UI premium) */}
        <div
          className={[
            "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl",
            config.accentClass,
          ].join(" ")}
        />

        {/* Quick actions (hover) - mais discreto e "dentro" do card */}
        <div className="absolute top-2 right-2 hidden group-hover/card:flex items-center gap-1 z-20">
          {apt.status === "agendado" && (
            <QuickAction
              icon={<Check className="h-4 w-4" />}
              label="Confirmar"
              onClick={() => onStatusChange?.(apt.id, "confirmado")}
            />
          )}

          {(apt.status === "agendado" || apt.status === "confirmado") && (
            <>
              <QuickAction
                icon={<UserCheck className="h-4 w-4" />}
                label="Check-in"
                onClick={() => {}}
              />
              <QuickAction
                icon={<Play className="h-4 w-4" />}
                label="Iniciar"
                onClick={() => {}}
              />
              <QuickAction
                icon={<CalendarClock className="h-4 w-4" />}
                label="Reagendar"
                onClick={() => {}}
              />
              <QuickAction
                icon={<X className="h-4 w-4" />}
                label="Cancelar"
                onClick={() => onStatusChange?.(apt.id, "cancelado")}
                destructive
              />
            </>
          )}

          {/* fallback: menu (se quiser depois abrir dropdown) */}
          <QuickAction
            icon={<MoreHorizontal className="h-4 w-4" />}
            label="Mais"
            onClick={() => {}}
          />
        </div>

        {/* Content */}
        <div className="relative h-full w-full pl-3 pr-2 py-2">
          <div className="flex items-start gap-2">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary">
                {initials}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              {/* Linha 1: Nome + modality */}
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate flex-1 leading-tight">
                  {apt.patient}
                </p>

                {apt.modality && (
                  <span className="opacity-70 flex-shrink-0">
                    {MODALITY_ICONS[apt.modality]}
                  </span>
                )}
              </div>

              {/* Linha 2: Tipo */}
              {!isCompact && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {apt.type}
                </p>
              )}
            </div>
          </div>

          {/* Rodapé: horário + duração */}
          <div
            className={[
              "mt-2 flex items-center gap-2",
              isCompact ? "mt-1" : "",
            ].join(" ")}
          >
            <div className="flex items-center gap-1 text-xs text-foreground/80">
              <Clock className="h-3.5 w-3.5 opacity-70" />
              <span className="truncate">
                {startTime} – {endTime}
              </span>
            </div>

            <span className="ml-auto text-xs text-foreground/70">
              {apt.duration}
            </span>
          </div>

          {/* Badge de status opcional (deixa mais parecido com print 2) */}
          {!isCompact && (
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]",
                  "bg-background/50 border border-border/50 text-foreground/70",
                ].join(" ")}
              >
                <span className={["h-2 w-2 rounded-full", config.dotClass].join(" ")} />
                {config.label}
              </span>
            </div>
          )}
        </div>
      </button>
    </TooltipProvider>
  );
};

export default AppointmentCard;
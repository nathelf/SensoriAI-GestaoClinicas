import { useState, useEffect } from "react";

interface CurrentTimeIndicatorProps {
  startHour: number;
  slotHeight: number;
  todayColumnIndex: number;
  totalColumns: number;
}

const CurrentTimeIndicator = ({ startHour, slotHeight, todayColumnIndex, totalColumns }: CurrentTimeIndicatorProps) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = (hours - startHour) * 60 + minutes;
  const topPx = (totalMinutes / 30) * slotHeight;

  if (hours < startHour || hours >= 19 || todayColumnIndex < 0) return null;

  // Calculate left position: skip the time column (60px), then offset by column
  const colWidth = `calc((100% - 60px) / ${totalColumns})`;
  const leftOffset = `calc(60px + ${todayColumnIndex} * ${colWidth})`;

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{ top: `${topPx}px`, left: leftOffset, width: colWidth }}
    >
      <div className="relative flex items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-destructive -ml-[5px] shadow-sm" />
        <div className="flex-1 h-[2px] bg-destructive opacity-70" />
      </div>
    </div>
  );
};

export default CurrentTimeIndicator;

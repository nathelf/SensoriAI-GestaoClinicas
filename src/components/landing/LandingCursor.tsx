import { useEffect, useState } from "react";

interface LandingCursorProps {
  visible: boolean;
}

/** Cursor customizado da landing (cursor-none na página + este elemento segue o mouse). */
export function LandingCursor({ visible }: LandingCursorProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-md pointer-events-none z-[9999] transition-opacity duration-150"
      style={{
        transform: `translate(${pos.x - 8}px, ${pos.y - 8}px)`,
      }}
      aria-hidden
    />
  );
}

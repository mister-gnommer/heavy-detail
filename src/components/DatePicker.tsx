import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import "react-day-picker/style.css";

interface Props {
  value: string; // yyyy-MM-dd
  onChange: (value: string) => void;
  max?: string; // yyyy-MM-dd
}

export default function DatePicker({ value, onChange, max }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const maxDate = max ? parse(max, "yyyy-MM-dd", new Date()) : undefined;

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        readOnly
        value={value}
        onClick={() => setOpen((o) => !o)}
        placeholder="yyyy-MM-dd"
        required
        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 cursor-pointer"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-background)",
          color: "var(--color-foreground)",
        }}
      />
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 50,
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            padding: "8px",
          }}
        >
          <DayPicker
            mode="single"
            selected={isValid(selected) ? selected : undefined}
            onSelect={(day) => {
              if (day) {
                onChange(format(day, "yyyy-MM-dd"));
                setOpen(false);
              }
            }}
            disabled={maxDate ? { after: maxDate } : undefined}
            defaultMonth={isValid(selected) ? selected : new Date()}
          />
        </div>
      )}
    </div>
  );
}

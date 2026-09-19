import React, { useEffect, useRef } from "react";
import { ChevronDown, Plus, X } from "lucide-react";

interface TableFormPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  onOpen?: () => void;
  triggerClassName?: string;
  children: React.ReactNode;
}

export const TableFormPopover: React.FC<TableFormPopoverProps> = ({
  open,
  onOpenChange,
  label,
  onOpen,
  triggerClassName = "btn-theme-primary btn-add",
  children,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (open) {
      onOpenChange(false);
      return;
    }
    onOpen?.();
    onOpenChange(true);
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target as Node)
      ) {
        onOpenChange(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange]);

  return (
    <div className="afrah-app-add-popover-wrap no-print" ref={wrapRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={triggerClassName}
        aria-expanded={open}
      >
        {open ? <X size={15} /> : <Plus size={15} strokeWidth={2.5} />}
        <span>{label}</span>
        <ChevronDown
          size={14}
          style={{
            transform: open ? "rotate(180deg)" : undefined,
            transition: "transform 0.15s ease",
          }}
        />
      </button>
      {open && <div className="afrah-app-add-popover">{children}</div>}
    </div>
  );
};

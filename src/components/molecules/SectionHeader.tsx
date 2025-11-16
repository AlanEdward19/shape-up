import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  expanded?: boolean;
  onToggle?: () => void;
  onAdd?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, expanded, onToggle, onAdd }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div>
        <h3 className="m-0 font-semibold text-base">{title}</h3>
        {description && (
          <p className="m-0 mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onAdd && (
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onAdd(); }} className="btn px-2 py-1">
            <Plus size={16} />
          </Button>
        )}
        <button
          type="button"
          aria-expanded={expanded}
          onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
          className="p-1 rounded hover:bg-accent"
        >
          <ChevronDown size={20} style={{ transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
        </button>
      </div>
    </div>
  );
};

export default SectionHeader;


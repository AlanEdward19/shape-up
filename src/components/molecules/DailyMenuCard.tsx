import React from "react";
import { DailyMenuDto } from "@/types/nutritionService";

interface DailyMenuCardProps {
  dailyMenu: DailyMenuDto;
  compact?: boolean;
  onSelect?: (dm: DailyMenuDto) => void;
  onDelete?: (dm: DailyMenuDto) => void;
}

const dayLabel = (d?: number) => {
  switch (d) {
    case 0: return "Domingo";
    case 1: return "Segunda";
    case 2: return "Terça";
    case 3: return "Quarta";
    case 4: return "Quinta";
    case 5: return "Sexta";
    case 6: return "Sábado";
    default: return "";
  }
};

const DailyMenuCard: React.FC<DailyMenuCardProps> = ({ dailyMenu, compact = true, onSelect, onDelete }) => {
  const mealsCount = dailyMenu.meals?.length || 0;
  return (
    <div
      className={(compact ? "relative " : "relative ") + (compact
        ? "border rounded-md p-3 flex flex-col items-center text-center bg-background cursor-pointer"
        : "border rounded-md p-3 flex flex-col gap-1 bg-background cursor-pointer")}
      onClick={() => onSelect?.(dailyMenu)}
    >
      {onDelete && (
        <button
          type="button"
          aria-label="Remover"
          className="absolute top-1 right-1 text-xs px-2 py-1 rounded hover:bg-accent"
          onClick={(e) => { e.stopPropagation(); onDelete(dailyMenu); }}
        >
          X
        </button>
      )}
      <div className="flex flex-col items-center">
        <span className="font-medium">{dayLabel(dailyMenu.dayOfWeek)}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        {mealsCount} refeição{mealsCount === 1 ? "" : "s"}
      </div>
    </div>
  );
};

export default DailyMenuCard;

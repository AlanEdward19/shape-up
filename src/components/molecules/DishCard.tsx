import React from "react";
import { DishDto } from "@/types/nutritionService";

interface DishCardProps {
  dish: DishDto;
  compact?: boolean;
  onSelect?: (dish: DishDto) => void;
  onDelete?: (dish: DishDto) => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, compact = true, onSelect, onDelete }) => {
  const count = dish.ingredients?.length || 0;
  return (
    <div className={(compact ? "relative " : "") + (compact ? "border rounded-md p-3 flex flex-col items-center text-center bg-background cursor-pointer" : "border rounded-md p-3 flex flex-col gap-1 bg-background cursor-pointer")}
      onClick={() => onSelect?.(dish)}>
      {compact && onDelete && (
        <button
          type="button"
          aria-label="Remover"
          className="absolute top-1 right-1 text-xs px-2 py-1 rounded hover:bg-accent"
          onClick={(e) => { e.stopPropagation(); onDelete(dish); }}
        >
          X
        </button>
      )}
      <div className="flex flex-col items-center">
        <span className="font-medium">{dish.name || "Sem nome"}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-2">{count} ingrediente{count === 1 ? "" : "s"}</div>
    </div>
  );
};

export default DishCard;

import React from "react";
import { MealDto } from "@/types/nutritionService";

interface MealCardProps {
  meal: MealDto;
  compact?: boolean;
  onSelect?: (meal: MealDto) => void;
  onDelete?: (meal: MealDto) => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, compact = true, onSelect, onDelete }) => {
  const dishesCount = meal.dishes?.length || 0;
  const ingredientsCount = meal.ingredients?.length || 0;
  return (
    <div
      className={(compact ? "relative " : "") + (compact ? "border rounded-md p-3 flex flex-col items-center text-center bg-background cursor-pointer" : "border rounded-md p-3 flex flex-col gap-1 bg-background cursor-pointer")}
      onClick={() => onSelect?.(meal)}
    >
      {compact && onDelete && (
        <button
          type="button"
          aria-label="Remover"
          className="absolute top-1 right-1 text-xs px-2 py-1 rounded hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(meal);
          }}
        >
          X
        </button>
      )}
      <div className="flex flex-col items-center">
        <span className="font-medium">{meal.name || "Sem nome"}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        {dishesCount} prato{dishesCount === 1 ? "" : "s"} • {ingredientsCount} ingrediente{ingredientsCount === 1 ? "" : "s"}
      </div>
    </div>
  );
};

export default MealCard;

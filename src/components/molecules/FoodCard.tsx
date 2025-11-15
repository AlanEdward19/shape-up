import React from "react";
import { FoodDto } from "@/types/nutritionService";
import { Button } from "@/components/ui/button";
import FoodNutrientsGrid from "./FoodNutrientsGrid";
import FoodDetails from "./FoodDetails";

interface FoodCardProps {
  food: FoodDto;
  onAdd?: (food: FoodDto) => void;
  onSelect?: (food: FoodDto) => void;
  showDetails?: boolean;
  loadingDetails?: boolean;
  onToggleDetails?: (id?: string) => void;
  addState?: 'idle' | 'loading' | 'done';
  compact?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onAdd, onSelect, showDetails, loadingDetails, onToggleDetails, addState, compact }) => {
  const isRevised = food.isRevised;
  const isAdding = addState === 'loading';
  const isDone = addState === 'done';

  return (
    <div className={compact ? "border rounded-md p-3 flex flex-col text-center bg-background" : "border rounded-md p-3 flex flex-col gap-1 bg-background"}>
      <div className={compact ? "flex flex-col items-center" : "flex items-center justify-between gap-2"}>
        <div className={compact ? "flex flex-col items-center" : "flex flex-col items-start"}>
          <div className="flex items-center gap-2">
            <span className="font-medium">{food.name || "Sem nome"}</span>
            {isRevised && <span>☑️</span>}
          </div>
          {food.brand && (
            <span className="text-xs text-muted-foreground">{food.brand}</span>
          )}
        </div>
      </div>

      <FoodNutrientsGrid info={food.nutritionalInfo} compact={compact} />

      {!compact && (
        <div className="flex items-center justify-between mt-2">
          <button type="button" className="text-xs text-primary underline" onClick={() => onToggleDetails?.(food.id)}>
            {loadingDetails ? "Carregando..." : showDetails ? "Esconder informações" : "Ver mais informações"}
          </button>
          <div className="flex items-center gap-2">
            {onAdd && (
              <Button type="button" size="sm" variant="default" disabled={!food.id || isAdding || isDone} onClick={() => onAdd?.(food)}>
                {isAdding ? "Adicionando..." : isDone ? "Adicionado" : "Adicionar"}
              </Button>
            )}
            {onSelect && (
              <Button type="button" size="sm" variant="outline" onClick={() => onSelect?.(food)}>
                Selecionar
              </Button>
            )}
          </div>
        </div>
      )}

      {showDetails && !compact && (
        <FoodDetails food={food} />
      )}
    </div>
  );
};

export default FoodCard;

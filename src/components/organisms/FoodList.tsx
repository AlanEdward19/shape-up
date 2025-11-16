import React from "react";
import { FoodDto } from "@/types/nutritionService";
import FoodCard from "@/components/molecules/FoodCard";

interface FoodListProps {
  foods: FoodDto[];
  detailsById?: Record<string, FoodDto>;
  expandedId?: string | null;
  onToggleDetails?: (id?: string) => void;
  onAdd?: (food: FoodDto) => void;
  onSelect?: (food: FoodDto) => void;
  addStateById?: Record<string, 'idle' | 'loading' | 'done'>;
  compact?: boolean;
  onDelete?: (food: FoodDto) => void;
}

export const FoodList: React.FC<FoodListProps> = ({ foods, detailsById, expandedId, onToggleDetails, onAdd, onSelect, addStateById, compact, onDelete }) => {
  return (
    <div className="flex flex-col gap-2">
      {foods.map((food) => (
        <FoodCard
          key={food.id || food.name}
          food={expandedId === food.id && detailsById?.[food.id!] ? detailsById[food.id!] : food}
          onAdd={onAdd}
          onSelect={onSelect}
          showDetails={expandedId === food.id}
          loadingDetails={false}
          onToggleDetails={onToggleDetails}
          addState={food.id ? addStateById?.[food.id] : undefined}
          compact={compact}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default FoodList;

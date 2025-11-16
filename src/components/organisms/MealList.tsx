import React from "react";
import { MealDto } from "@/types/nutritionService";
import MealCard from "@/components/molecules/MealCard";

interface MealListProps {
  meals: MealDto[];
  compact?: boolean;
  onSelect?: (meal: MealDto) => void;
  onDelete?: (meal: MealDto) => void;
}

const MealList: React.FC<MealListProps> = ({ meals, compact = true, onSelect, onDelete }) => {
  return (
    <div className="flex flex-col gap-2">
      {meals.map((m) => (
        <MealCard key={m.id || m.name} meal={m} compact={compact} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default MealList;

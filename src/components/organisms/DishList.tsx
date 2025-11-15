import React from "react";
import { DishDto } from "@/types/nutritionService";
import DishCard from "@/components/molecules/DishCard";

interface DishListProps {
  dishes: DishDto[];
  compact?: boolean;
  onSelect?: (dish: DishDto) => void;
  onDelete?: (dish: DishDto) => void;
}

const DishList: React.FC<DishListProps> = ({ dishes, compact = true, onSelect, onDelete }) => {
  return (
    <div className="flex flex-col gap-2">
      {dishes.map((d) => (
        <DishCard key={d.id || d.name} dish={d} compact={compact} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default DishList;

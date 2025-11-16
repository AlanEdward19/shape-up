import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FoodDto } from "@/types/nutritionService";
import SectionHeader from "@/components/molecules/SectionHeader";
import EmptyState from "@/components/atoms/EmptyState";
import FoodList from "./FoodList";

interface FoodListSectionProps {
  title: string;
  description?: string;
  foods: FoodDto[];
  expanded: boolean;
  onToggle: () => void;
  onAddClick?: () => void;
  onDeleteFood?: (food: FoodDto) => void;
}

export const FoodListSection: React.FC<FoodListSectionProps> = ({ title, description, foods, expanded, onToggle, onAddClick, onDeleteFood }) => {
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <div className="card p-4 cursor-pointer">
        <CollapsibleTrigger asChild>
          <div>
            <SectionHeader title={title} description={description} expanded={expanded} onToggle={onToggle} onAdd={onAddClick} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          {foods.length === 0 ? (
            <EmptyState message="Nenhuma comida cadastrada." />
          ) : (
            <FoodList foods={foods} compact={true} onDelete={onDeleteFood} />
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default FoodListSection;

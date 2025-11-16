import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MealDto } from "@/types/nutritionService";
import SectionHeader from "@/components/molecules/SectionHeader";
import EmptyState from "@/components/atoms/EmptyState";
import MealList from "./MealList";

interface MealListSectionProps {
  title: string;
  description?: string;
  meals: MealDto[];
  expanded: boolean;
  onToggle: () => void;
  onAddClick?: () => void;
  onDeleteMeal?: (meal: MealDto) => void;
}

const MealListSection: React.FC<MealListSectionProps> = ({ title, description, meals, expanded, onToggle, onAddClick, onDeleteMeal }) => {
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <div className="card p-4 cursor-pointer">
        <CollapsibleTrigger asChild>
          <div>
            <SectionHeader title={title} description={description} expanded={expanded} onToggle={onToggle} onAdd={onAddClick} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          {meals.length === 0 ? (
            <EmptyState message="Nenhuma refeição cadastrada." />
          ) : (
            <MealList meals={meals} compact={true} onDelete={onDeleteMeal} />
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default MealListSection;

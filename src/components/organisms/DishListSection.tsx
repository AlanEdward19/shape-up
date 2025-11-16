import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DishDto } from "@/types/nutritionService";
import SectionHeader from "@/components/molecules/SectionHeader";
import EmptyState from "@/components/atoms/EmptyState";
import DishList from "./DishList";

interface DishListSectionProps {
  title: string;
  description?: string;
  dishes: DishDto[];
  expanded: boolean;
  onToggle: () => void;
  onAddClick?: () => void;
  onDeleteDish?: (dish: DishDto) => void;
}

const DishListSection: React.FC<DishListSectionProps> = ({ title, description, dishes, expanded, onToggle, onAddClick, onDeleteDish }) => {
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <div className="card p-4 cursor-pointer">
        <CollapsibleTrigger asChild>
          <div>
            <SectionHeader title={title} description={description} expanded={expanded} onToggle={onToggle} onAdd={onAddClick} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          {dishes.length === 0 ? (
            <EmptyState message="Nenhum prato encontrado." />
          ) : (
            <DishList dishes={dishes} compact={true} onDelete={onDeleteDish} />
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default DishListSection;

import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DailyMenuDto } from "@/types/nutritionService";
import SectionHeader from "@/components/molecules/SectionHeader";
import EmptyState from "@/components/atoms/EmptyState";
import DailyMenuList from "./DailyMenuList";

interface DailyMenuListSectionProps {
  title: string;
  description?: string;
  dailyMenus: DailyMenuDto[];
  expanded: boolean;
  onToggle: () => void;
  onAddClick?: () => void;
  onDeleteDailyMenu?: (dm: DailyMenuDto) => void;
}

const DailyMenuListSection: React.FC<DailyMenuListSectionProps> = ({ title, description, dailyMenus, expanded, onToggle, onAddClick, onDeleteDailyMenu }) => {
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <div className="card p-4 cursor-pointer">
        <CollapsibleTrigger asChild>
          <div>
            <SectionHeader title={title} description={description} expanded={expanded} onToggle={onToggle} onAdd={onAddClick} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          {dailyMenus.length === 0 ? (
            <EmptyState message="Nenhum cardápio diário cadastrado." />
          ) : (
            <DailyMenuList dailyMenus={dailyMenus} compact={true} onDelete={onDeleteDailyMenu} />
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default DailyMenuListSection;

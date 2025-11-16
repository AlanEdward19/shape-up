import React from "react";
import { DailyMenuDto } from "@/types/nutritionService";
import DailyMenuCard from "@/components/molecules/DailyMenuCard";

interface DailyMenuListProps {
  dailyMenus: DailyMenuDto[];
  compact?: boolean;
  onSelect?: (dm: DailyMenuDto) => void;
  onDelete?: (dm: DailyMenuDto) => void;
}

const DailyMenuList: React.FC<DailyMenuListProps> = ({ dailyMenus, compact = true, onSelect, onDelete }) => {
  return (
    <div className="flex flex-col gap-2">
      {dailyMenus.map((dm) => (
        <DailyMenuCard key={dm.id || String(dm.dayOfWeek)} dailyMenu={dm} compact={compact} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default DailyMenuList;

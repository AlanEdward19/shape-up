import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabItem { value: string; label: string; }

interface NutritionTabsProps {
  value: string;
  onValueChange: (v: string) => void;
  items: TabItem[];
}

export const NutritionTabs: React.FC<NutritionTabsProps> = ({ value, onValueChange, items }) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="w-full flex justify-center mt-3">
      <TabsList>
        {items.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default NutritionTabs;


import React from "react";
import { NutritionalInfo } from "@/types/nutritionService";

interface FoodNutrientsGridProps {
  info: NutritionalInfo | null | undefined;
  className?: string;
  compact?: boolean;
}

const fmt = (v: number | null | undefined) => (v === null || v === undefined ? "-" : v);

export const FoodNutrientsGrid: React.FC<FoodNutrientsGridProps> = ({ info, className, compact }) => {
  const calories = info?.calories;
  const carbs = info?.macronutrients?.carbohydrates?.total;
  const proteins = info?.macronutrients?.proteins;
  const fats = info?.macronutrients?.fats?.total;
  if (compact) {
    return (
      <div className={["flex flex-col text-xs mt-2", className || ""].join(" ")}>
        <div className="grid grid-cols-4 gap-4 font-semibold">
          <span>kcal</span>
          <span>carbs</span>
          <span>prots</span>
          <span>fats</span>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-1">
          <span>{fmt(calories)}</span>
          <span>{fmt(carbs)}</span>
          <span>{fmt(proteins)}</span>
          <span>{fmt(fats)}</span>
        </div>
      </div>
    );
  }
  return (
    <div className={["grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-xs mt-1", className || ""].join(" ")}>
      <div>
        <span className="font-semibold">Calorias:</span> <span>{fmt(calories)}</span>
      </div>
      <div>
        <span className="font-semibold">Carboidratos:</span> <span>{fmt(carbs)}</span>
      </div>
      <div>
        <span className="font-semibold">Proteínas:</span> <span>{fmt(proteins)}</span>
      </div>
      <div>
        <span className="font-semibold">Gorduras:</span> <span>{fmt(fats)}</span>
      </div>
    </div>
  );
};

export default FoodNutrientsGrid;

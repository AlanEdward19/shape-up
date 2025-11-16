import React from "react";
import NutritionTabs from "@/components/molecules/NutritionTabs";

interface NutritionTemplateProps {
  activeTab: string;
  onTabChange: (v: string) => void;
  left: React.ReactNode;
  right: React.ReactNode;
}

export const NutritionTemplate: React.FC<NutritionTemplateProps> = ({ activeTab, onTabChange, left, right }) => {
  return (
    <div className="training-main">
      <section className="col">
        <div className="flex flex-col items-center w-full">
          <NutritionTabs
            value={activeTab}
            onValueChange={onTabChange}
            items={[
              { value: "minha-nutricao", label: "Minha Nutrição" },
              { value: "clientes", label: "Clientes" },
            ]}
          />
        </div>
        <div className="list" style={{ padding: "20px 16px", gap: "12px" }}>
          {left}
        </div>
      </section>
      <section className="col">
        {right}
      </section>
    </div>
  );
};

export default NutritionTemplate;
